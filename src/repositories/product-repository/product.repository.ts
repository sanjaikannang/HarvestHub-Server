import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ProductStatus } from 'src/utils/enum';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Product, ProductDocument } from 'src/schemas/Product/product.schema';


@Injectable()
export class ProductRepositoryService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) { }


    // Create product
    async create(data: Partial<Product>): Promise<ProductDocument> {
        try {
            const product = new this.productModel(data);
            return await product.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to create product', error);
        }
    }


    // Find product by id
    async findById(id: string): Promise<ProductDocument | null> {
        try {
            return await this.productModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find product by id', error);
        }
    }


    // List a farmer's own products, optionally filtered by status
    async findByFarmerId(farmerId: string, status?: ProductStatus): Promise<ProductDocument[]> {
        try {
            const filter: Record<string, unknown> = { farmerId: new Types.ObjectId(farmerId) };
            if (status) {
                filter.status = status;
            }
            return await this.productModel.find(filter).sort({ createdAt: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list products by farmer', error);
        }
    }


    // List products for review, optionally scoped to a district and/or status
    async findAll(filter: { districtId?: string; status?: ProductStatus }): Promise<ProductDocument[]> {
        try {
            const query: Record<string, unknown> = {};
            if (filter.districtId) {
                query.districtId = new Types.ObjectId(filter.districtId);
            }
            if (filter.status) {
                query.status = filter.status;
            }
            return await this.productModel.find(query).sort({ createdAt: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list products', error);
        }
    }


    // Update editable listing fields (name/description/images/etc.) — status
    // transitions go through updateStatus instead
    async updateDetails(id: string, updates: Partial<Product>): Promise<ProductDocument | null> {
        try {
            const updated = await this.productModel.findByIdAndUpdate(id, updates, { new: true }).exec();
            if (!updated) {
                throw new NotFoundException(`Product with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update product', error);
        }
    }


    // Products ready for their bidding session to open — Listed and past their
    // scheduled start time (see BiddingService's scheduler)
    async findDueForBidding(now: Date): Promise<ProductDocument[]> {
        try {
            return await this.productModel.find({ status: ProductStatus.LISTED, biddingStartTime: { $lte: now } }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find products due for bidding', error);
        }
    }


    // Marketplace browse — products currently for sale or awaiting their
    // session, for Buyers (any district, any role beyond Farmer/Admin review)
    async findByStatuses(statuses: ProductStatus[]): Promise<ProductDocument[]> {
        try {
            return await this.productModel.find({ status: { $in: statuses } }).sort({ biddingStartTime: 1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list marketplace products', error);
        }
    }


    // Transition status, optionally setting/clearing rejectionReason and changeRequestNotes
    async updateStatus(
        id: string,
        status: ProductStatus,
        fields: { rejectionReason?: string | null; changeRequestNotes?: string | null } = {},
    ): Promise<ProductDocument | null> {
        try {
            const update: Record<string, unknown> = { status };

            if (fields.rejectionReason !== undefined) {
                update.rejectionReason = fields.rejectionReason;
            }
            if (fields.changeRequestNotes !== undefined) {
                update.changeRequestNotes = fields.changeRequestNotes;
            }

            const updated = await this.productModel.findByIdAndUpdate(id, update, { new: true }).exec();
            if (!updated) {
                throw new NotFoundException(`Product with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update product status', error);
        }
    }

}
