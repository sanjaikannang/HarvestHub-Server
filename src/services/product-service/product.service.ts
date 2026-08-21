import { Types } from 'mongoose';
import { CollectionMethod, ProductStatus, UnitOfMeasure, UserRole } from 'src/utils/enum';
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DistrictService, RequestingUser } from 'src/services/district-service/district.service';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';
import { ProductRepositoryService } from 'src/repositories/product-repository/product.repository';
import { CategoryRepositoryService } from 'src/repositories/category-repository/category.repository';
import { AuditAction } from 'src/schemas/AuditLog/audit-log.schema';
import { AuditLogRepositoryService } from 'src/repositories/audit-log-repository/audit-log.repository';
import { Product, ProductDocument } from 'src/schemas/Product/product.schema';

// Editable while the listing hasn't moved past the Catalog module's own
// review stage (see modules/03-catalog-management/requirement.md)
const EDITABLE_STATUSES = [ProductStatus.SUBMITTED, ProductStatus.UNDER_REVIEW, ProductStatus.CHANGES_REQUESTED, ProductStatus.REJECTED];

// Statuses a District Admin/Super Admin can act on from this module — beyond
// this the product has moved into Inspection (04) territory
const REVIEWABLE_SOURCE_STATUSES = [ProductStatus.SUBMITTED, ProductStatus.UNDER_REVIEW];

const BIDDING_DURATION_MS = 30 * 60 * 1000;

export interface ProductSubmissionData {
    categoryId: string;
    subcategoryKey: string;
    name: string;
    description: string;
    images: string[];
    estimatedQuantity: number;
    unitOfMeasure: UnitOfMeasure;
    startingPrice: number;
    biddingDate: Date;
    biddingStartTime: Date;
    collectionMethod: CollectionMethod;
}

export type ProductEditData = Partial<ProductSubmissionData>;

@Injectable()
export class ProductService {
    constructor(
        private readonly productRepositoryService: ProductRepositoryService,
        private readonly categoryRepositoryService: CategoryRepositoryService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly districtService: DistrictService,
        private readonly auditLogRepositoryService: AuditLogRepositoryService,
    ) { }


    // Create Product API Endpoint (Farmer)
    async createProductAPI(farmerId: string, data: ProductSubmissionData) {
        const farmer = await this.userRepositoryService.findById(farmerId);
        if (!farmer) {
            throw new NotFoundException('Farmer account not found');
        }

        // TODO: this will start rejecting real accounts once OTP verification
        // (Notification module, 09) exists — for now isPhoneVerified defaults
        // false for everyone, per modules/01-auth-user-management.
        if (!farmer.isPhoneVerified) {
            throw new ForbiddenException('Your phone number must be verified before you can submit a product');
        }

        if (!farmer.districtId) {
            throw new BadRequestException('You must be assigned to a district before submitting a product');
        }

        await this.assertValidCategoryAndSubcategory(data.categoryId, data.subcategoryKey);

        const biddingStartTime = new Date(data.biddingStartTime);
        const biddingEndTime = new Date(biddingStartTime.getTime() + BIDDING_DURATION_MS);

        const product = await this.productRepositoryService.create({
            farmerId: new Types.ObjectId(farmerId),
            districtId: farmer.districtId,
            categoryId: new Types.ObjectId(data.categoryId),
            subcategoryKey: data.subcategoryKey,
            name: data.name,
            description: data.description,
            images: data.images,
            estimatedQuantity: data.estimatedQuantity,
            unitOfMeasure: data.unitOfMeasure,
            startingPrice: data.startingPrice,
            biddingDate: data.biddingDate,
            biddingStartTime,
            biddingEndTime,
            collectionMethod: data.collectionMethod,
            status: ProductStatus.SUBMITTED,
        });

        return this.toSummary(product);
    }


    // Update Product API Endpoint (Farmer, own product only) — editing while
    // Rejected resubmits it (status returns to Submitted, per requirement.md)
    async updateProductAPI(productId: string, farmerId: string, data: ProductEditData) {
        const product = await this.productRepositoryService.findById(productId);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (product.farmerId.toString() !== farmerId) {
            throw new ForbiddenException('You do not have access to this product');
        }

        if (!EDITABLE_STATUSES.includes(product.status)) {
            throw new BadRequestException('This product can no longer be edited');
        }

        const categoryId = data.categoryId ?? product.categoryId.toString();
        const subcategoryKey = data.subcategoryKey ?? product.subcategoryKey;
        if (data.categoryId || data.subcategoryKey) {
            await this.assertValidCategoryAndSubcategory(categoryId, subcategoryKey);
        }

        const updates: Partial<Product> = {
            ...(data.categoryId ? { categoryId: new Types.ObjectId(data.categoryId) } : {}),
            ...(data.subcategoryKey ? { subcategoryKey: data.subcategoryKey } : {}),
            ...(data.name ? { name: data.name } : {}),
            ...(data.description ? { description: data.description } : {}),
            ...(data.images ? { images: data.images } : {}),
            ...(data.estimatedQuantity !== undefined ? { estimatedQuantity: data.estimatedQuantity } : {}),
            ...(data.unitOfMeasure ? { unitOfMeasure: data.unitOfMeasure } : {}),
            ...(data.startingPrice !== undefined ? { startingPrice: data.startingPrice } : {}),
            ...(data.biddingDate ? { biddingDate: data.biddingDate } : {}),
            ...(data.collectionMethod ? { collectionMethod: data.collectionMethod } : {}),
        };

        if (data.biddingStartTime) {
            const biddingStartTime = new Date(data.biddingStartTime);
            updates.biddingStartTime = biddingStartTime;
            updates.biddingEndTime = new Date(biddingStartTime.getTime() + BIDDING_DURATION_MS);
        }

        // Rejected AND changes-requested edits both count as the farmer acting
        // on reviewer feedback — send it back to Submitted so it reappears in
        // the review queue, rather than leaving it stuck in a dead-end status.
        const wasAwaitingFarmerAction = product.status === ProductStatus.REJECTED || product.status === ProductStatus.CHANGES_REQUESTED;
        if (wasAwaitingFarmerAction) {
            updates.status = ProductStatus.SUBMITTED;
            // null (not undefined) — Mongoose drops undefined keys from the
            // update doc instead of clearing them
            (updates as Record<string, unknown>).rejectionReason = null;
            (updates as Record<string, unknown>).changeRequestNotes = null;
        }

        const updated = await this.productRepositoryService.updateDetails(productId, updates);

        if (wasAwaitingFarmerAction) {
            await this.auditLogRepositoryService.create({
                actorId: new Types.ObjectId(farmerId),
                actorRole: UserRole.FARMER,
                action: AuditAction.PRODUCT_RESUBMITTED,
                targetEntityType: 'product',
                targetEntityId: new Types.ObjectId(productId),
            });
        }

        return this.toSummary(updated!);
    }


    // List My Products API Endpoint (Farmer)
    async listMyProductsAPI(farmerId: string, status?: ProductStatus) {
        const products = await this.productRepositoryService.findByFarmerId(farmerId, status);
        return products.map((product) => this.toSummary(product));
    }


    // Get Product By Id API Endpoint (Farmer: own only, District Admin: own
    // district only, Super Admin: any)
    async getProductByIdAPI(productId: string, requestingUser: RequestingUser) {
        const product = await this.productRepositoryService.findById(productId);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        await this.assertCanAccessProduct(product, requestingUser);

        return this.toSummary(product);
    }


    // List Products For Review API Endpoint (District Admin: own district
    // only, Super Admin: all or filtered by districtId)
    async listProductsForReviewAPI(requestingUser: RequestingUser, filters: { districtId?: string; status?: ProductStatus }) {
        let districtId = filters.districtId;

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            if (districtId) {
                await this.districtService.assertOwnDistrict(requestingUser.sub, districtId);
            } else {
                districtId = await this.districtService.resolveDistrictAdminDistrictId(requestingUser.sub);
            }
        }

        const products = await this.productRepositoryService.findAll({ districtId, status: filters.status });
        return products.map((product) => this.toSummary(product));
    }


    // Start Review API Endpoint (Super Admin, District Admin — own district only)
    async startReviewAPI(productId: string, requestingUser: RequestingUser) {
        const product = await this.getReviewableProduct(productId, requestingUser);

        if (product.status !== ProductStatus.SUBMITTED) {
            throw new BadRequestException('Only a submitted product can move to review');
        }

        const updated = await this.productRepositoryService.updateStatus(productId, ProductStatus.UNDER_REVIEW);

        await this.logReviewAction(requestingUser, AuditAction.PRODUCT_REVIEW_STARTED, productId);

        return this.toSummary(updated!);
    }


    // Request Changes API Endpoint (Super Admin, District Admin — own district only)
    async requestChangesAPI(productId: string, notes: string, requestingUser: RequestingUser) {
        const product = await this.getReviewableProduct(productId, requestingUser);

        if (!REVIEWABLE_SOURCE_STATUSES.includes(product.status)) {
            throw new BadRequestException('Changes can only be requested while a product is submitted or under review');
        }

        const updated = await this.productRepositoryService.updateStatus(productId, ProductStatus.CHANGES_REQUESTED, { changeRequestNotes: notes });

        await this.logReviewAction(requestingUser, AuditAction.PRODUCT_CHANGES_REQUESTED, productId, notes);

        return this.toSummary(updated!);
    }


    // Reject Product API Endpoint (Super Admin, District Admin — own district only)
    async rejectProductAPI(productId: string, reason: string, requestingUser: RequestingUser) {
        const product = await this.getReviewableProduct(productId, requestingUser);

        if (!REVIEWABLE_SOURCE_STATUSES.includes(product.status)) {
            throw new BadRequestException('A product can only be rejected while it is submitted or under review');
        }

        const updated = await this.productRepositoryService.updateStatus(productId, ProductStatus.REJECTED, { rejectionReason: reason });

        await this.logReviewAction(requestingUser, AuditAction.PRODUCT_REJECTED, productId, reason);

        return this.toSummary(updated!);
    }


    private async getReviewableProduct(productId: string, requestingUser: RequestingUser): Promise<ProductDocument> {
        const product = await this.productRepositoryService.findById(productId);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            await this.districtService.assertOwnDistrict(requestingUser.sub, product.districtId.toString());
        }

        return product;
    }


    private async assertCanAccessProduct(product: ProductDocument, requestingUser: RequestingUser): Promise<void> {
        if (requestingUser.role === UserRole.FARMER) {
            if (product.farmerId.toString() !== requestingUser.sub) {
                throw new ForbiddenException('You do not have access to this product');
            }
            return;
        }

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            await this.districtService.assertOwnDistrict(requestingUser.sub, product.districtId.toString());
        }
    }


    private async assertValidCategoryAndSubcategory(categoryId: string, subcategoryKey: string): Promise<void> {
        const category = await this.categoryRepositoryService.findById(categoryId);
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        if (!category.isActive) {
            throw new BadRequestException('Cannot use an inactive category');
        }

        const hasSubcategory = category.subcategories.some((subcategory) => subcategory.key === subcategoryKey);
        if (!hasSubcategory) {
            throw new BadRequestException(`Subcategory "${subcategoryKey}" does not belong to this category`);
        }
    }


    private async logReviewAction(requestingUser: RequestingUser, action: AuditAction, productId: string, reason?: string): Promise<void> {
        await this.auditLogRepositoryService.create({
            actorId: new Types.ObjectId(requestingUser.sub),
            actorRole: requestingUser.role,
            action,
            targetEntityType: 'product',
            targetEntityId: new Types.ObjectId(productId),
            ...(reason ? { reason } : {}),
        });
    }


    private toSummary(product: ProductDocument) {
        return {
            id: (product._id as Types.ObjectId).toString(),
            farmerId: product.farmerId.toString(),
            districtId: product.districtId.toString(),
            categoryId: product.categoryId.toString(),
            subcategoryKey: product.subcategoryKey,
            name: product.name,
            description: product.description,
            images: product.images,
            estimatedQuantity: product.estimatedQuantity,
            unitOfMeasure: product.unitOfMeasure,
            verifiedQuantity: product.verifiedQuantity,
            qualityGrade: product.qualityGrade,
            startingPrice: product.startingPrice,
            finalStartingPrice: product.finalStartingPrice,
            biddingDate: product.biddingDate,
            biddingStartTime: product.biddingStartTime,
            biddingEndTime: product.biddingEndTime,
            collectionMethod: product.collectionMethod,
            status: product.status,
            rejectionReason: product.rejectionReason,
            changeRequestNotes: product.changeRequestNotes,
            inspectionId: product.inspectionId?.toString(),
        };
    }

}
