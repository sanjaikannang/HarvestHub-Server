import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

}
