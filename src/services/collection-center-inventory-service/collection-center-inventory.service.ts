import { Types } from 'mongoose';
import { InventoryStatus, UserRole } from 'src/utils/enum';
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DistrictService, RequestingUser } from 'src/services/district-service/district.service';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';
import { CollectionCenterRepositoryService } from 'src/repositories/collection-center-repository/collection-center.repository';
import { CollectionCenterInventoryRepositoryService } from 'src/repositories/collection-center-inventory-repository/collection-center-inventory.repository';
import { CollectionCenterInventory, CollectionCenterInventoryDocument } from 'src/schemas/CollectionCenterInventory/collection-center-inventory.schema';

@Injectable()
export class CollectionCenterInventoryService {
    constructor(
        private readonly inventoryRepositoryService: CollectionCenterInventoryRepositoryService,
        private readonly collectionCenterRepositoryService: CollectionCenterRepositoryService,
        private readonly districtService: DistrictService,
        private readonly userRepositoryService: UserRepositoryService,
    ) { }


    // List Inventory API Endpoint (District Admin: own district's collection
    // centers only, Super Admin: all or filtered by collectionCenterId)
    async listInventoryAPI(requestingUser: RequestingUser, filters: { collectionCenterId?: string; status?: InventoryStatus }) {
        let collectionCenterIds: string[] | undefined;

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            const ownDistrictId = await this.districtService.resolveDistrictAdminDistrictId(requestingUser.sub);

            if (filters.collectionCenterId) {
                const center = await this.collectionCenterRepositoryService.findById(filters.collectionCenterId);
                if (!center || center.districtId.toString() !== ownDistrictId) {
                    throw new ForbiddenException('You do not have access to this collection center');
                }
                collectionCenterIds = [filters.collectionCenterId];
            } else {
                const centers = await this.collectionCenterRepositoryService.findAll(ownDistrictId);
                collectionCenterIds = centers.map((center) => (center._id as Types.ObjectId).toString());
            }
        } else if (filters.collectionCenterId) {
            collectionCenterIds = [filters.collectionCenterId];
        }

        const entries = await this.inventoryRepositoryService.findAll({ collectionCenterIds, status: filters.status });
        return entries.map((entry) => this.toSummary(entry));
    }


    // Get Inventory Entry By Id API Endpoint
    async getInventoryByIdAPI(id: string, requestingUser: RequestingUser) {
        const entry = await this.getScopedEntry(id, requestingUser);
        return this.toSummary(entry);
    }


    // Reserve For Sale API Endpoint (District Admin: own district, Super Admin: any)
    // TODO: this is normally triggered automatically by a successful sale +
    // payment (Bidding Engine 06 / Payment Escrow 07, neither built yet) —
    // exposed as a manual admin action until then, per requirement.md.
    async reserveAPI(id: string, requestingUser: RequestingUser) {
        const entry = await this.getScopedEntry(id, requestingUser);

        if (entry.status !== InventoryStatus.IN_STORAGE) {
            throw new BadRequestException('Only in-storage inventory can be reserved for sale');
        }

        const updated = await this.inventoryRepositoryService.updateStatus(id, InventoryStatus.RESERVED_FOR_SALE, { reservedAt: new Date() });
        return this.toSummary(updated!);
    }


    // Dispatch API Endpoint (District Admin: own district, Super Admin: any) —
    // normally triggered by the assigned Delivery Partner recording pickup
    // (Order & Delivery Management, module 08, not built) — exposed as a
    // manual admin action until then.
    async dispatchAPI(id: string, deliveryPartnerId: string, requestingUser: RequestingUser) {
        const entry = await this.getScopedEntry(id, requestingUser);

        if (entry.status !== InventoryStatus.RESERVED_FOR_SALE) {
            throw new BadRequestException('Only inventory reserved for sale can be dispatched');
        }

        const deliveryPartner = await this.userRepositoryService.findById(deliveryPartnerId);
        if (!deliveryPartner) {
            throw new NotFoundException('Delivery partner not found');
        }
        if (deliveryPartner.role !== UserRole.DELIVERY_PARTNER) {
            throw new BadRequestException('Only a user with the DELIVERY_PARTNER role can be assigned to a dispatch');
        }

        const updated = await this.inventoryRepositoryService.updateStatus(id, InventoryStatus.DISPATCHED, {
            dispatchedAt: new Date(),
            deliveryPartnerId: new Types.ObjectId(deliveryPartnerId),
        });
        return this.toSummary(updated!);
    }


    private async getScopedEntry(id: string, requestingUser: RequestingUser): Promise<CollectionCenterInventoryDocument> {
        const entry = await this.inventoryRepositoryService.findById(id);
        if (!entry) {
            throw new NotFoundException('Inventory entry not found');
        }

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            const center = await this.collectionCenterRepositoryService.findById(entry.collectionCenterId.toString());
            if (!center) {
                throw new NotFoundException('Collection center not found');
            }
            await this.districtService.assertOwnDistrict(requestingUser.sub, center.districtId.toString());
        }

        return entry;
    }


    private toSummary(entry: CollectionCenterInventoryDocument) {
        return {
            id: (entry._id as Types.ObjectId).toString(),
            collectionCenterId: entry.collectionCenterId.toString(),
            productId: entry.productId.toString(),
            receivedQuantity: entry.receivedQuantity,
            receivedDate: entry.receivedDate,
            status: entry.status,
            reservedAt: entry.reservedAt,
            dispatchedAt: entry.dispatchedAt,
            deliveryPartnerId: entry.deliveryPartnerId?.toString(),
        };
    }

}
