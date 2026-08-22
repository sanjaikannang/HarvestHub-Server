import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { InventoryStatus } from 'src/utils/enum';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CollectionCenterInventory, CollectionCenterInventoryDocument } from 'src/schemas/CollectionCenterInventory/collection-center-inventory.schema';


@Injectable()
export class CollectionCenterInventoryRepositoryService {
    constructor(
        @InjectModel(CollectionCenterInventory.name) private inventoryModel: Model<CollectionCenterInventoryDocument>,
    ) { }


    // Log a product's verified quantity as received at a Collection Center —
    // called on Inspection approval (see InspectionService.decideAPI)
    async create(data: Partial<CollectionCenterInventory>): Promise<CollectionCenterInventoryDocument> {
        try {
            const entry = new this.inventoryModel(data);
            return await entry.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to create inventory entry', error);
        }
    }


    // Find inventory entry by id
    async findById(id: string): Promise<CollectionCenterInventoryDocument | null> {
        try {
            return await this.inventoryModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find inventory entry by id', error);
        }
    }


    // Unique per product (see schema index) — used by Payment/Order & Delivery
    // to reserve/dispatch the matching physical stock
    async findByProductId(productId: string): Promise<CollectionCenterInventoryDocument | null> {
        try {
            return await this.inventoryModel.findOne({ productId: new Types.ObjectId(productId) }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find inventory entry by product', error);
        }
    }


    // List inventory, optionally scoped to a set of collection centers and/or a status
    async findAll(filter: { collectionCenterIds?: string[]; status?: InventoryStatus }): Promise<CollectionCenterInventoryDocument[]> {
        try {
            const query: Record<string, unknown> = {};
            if (filter.collectionCenterIds) {
                query.collectionCenterId = { $in: filter.collectionCenterIds.map((id) => new Types.ObjectId(id)) };
            }
            if (filter.status) {
                query.status = filter.status;
            }
            return await this.inventoryModel.find(query).sort({ receivedDate: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list inventory', error);
        }
    }


    // Transition status — reserve (in_storage -> reserved_for_sale) or
    // dispatch (reserved_for_sale -> dispatched)
    async updateStatus(
        id: string,
        status: InventoryStatus,
        fields: { reservedAt?: Date; dispatchedAt?: Date; deliveryPartnerId?: Types.ObjectId } = {},
    ): Promise<CollectionCenterInventoryDocument | null> {
        try {
            const updated = await this.inventoryModel.findByIdAndUpdate(id, { status, ...fields }, { new: true }).exec();
            if (!updated) {
                throw new NotFoundException(`Inventory entry with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update inventory status', error);
        }
    }

}
