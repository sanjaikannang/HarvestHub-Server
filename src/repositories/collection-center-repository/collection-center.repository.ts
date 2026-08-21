import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CollectionCenter, CollectionCenterAddress, CollectionCenterDocument } from 'src/schemas/CollectionCenter/collection-center.schema';


@Injectable()
export class CollectionCenterRepositoryService {
    constructor(
        @InjectModel(CollectionCenter.name) private collectionCenterModel: Model<CollectionCenterDocument>,
    ) { }


    // Create collection center
    async create(data: Partial<CollectionCenter>): Promise<CollectionCenterDocument> {
        try {
            const collectionCenter = new this.collectionCenterModel(data);
            return await collectionCenter.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to create collection center', error);
        }
    }


    // Find collection center by id
    async findById(id: string): Promise<CollectionCenterDocument | null> {
        try {
            return await this.collectionCenterModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find collection center by id', error);
        }
    }


    // List collection centers, optionally scoped to a district
    async findAll(districtId?: string): Promise<CollectionCenterDocument[]> {
        try {
            const filter = districtId ? { districtId: new Types.ObjectId(districtId) } : {};
            return await this.collectionCenterModel.find(filter).sort({ name: 1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list collection centers', error);
        }
    }


    // Update address/contact/capacity/name/isActive
    async updateDetails(
        id: string,
        updates: Partial<{ name: string; address: CollectionCenterAddress; contactPhone: string; capacityKg: number; isActive: boolean }>,
    ): Promise<CollectionCenterDocument | null> {
        try {
            const updated = await this.collectionCenterModel.findByIdAndUpdate(id, updates, { new: true }).exec();
            if (!updated) {
                throw new NotFoundException(`Collection center with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update collection center', error);
        }
    }

}
