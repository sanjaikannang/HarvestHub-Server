import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { District, DistrictDocument } from 'src/schemas/District/district.schema';


@Injectable()
export class DistrictRepositoryService {
    constructor(
        @InjectModel(District.name) private districtModel: Model<DistrictDocument>,
    ) { }


    // Create district
    async create(data: Partial<District>): Promise<DistrictDocument> {
        try {
            const district = new this.districtModel(data);
            return await district.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to create district', error);
        }
    }


    // Find district by id
    async findById(id: string): Promise<DistrictDocument | null> {
        try {
            return await this.districtModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find district by id', error);
        }
    }


    // Find district by name + state (used to enforce the unique index up front, with a clean error message)
    async findByNameAndState(name: string, state: string): Promise<DistrictDocument | null> {
        try {
            return await this.districtModel.findOne({ name, state }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find district by name and state', error);
        }
    }


    // Find the district currently administered by this user, if any — used when
    // reassigning a District Admin to keep the 1 district <-> 1 admin invariant.
    async findByDistrictAdminId(userId: string): Promise<DistrictDocument | null> {
        try {
            return await this.districtModel.findOne({ districtAdminId: new Types.ObjectId(userId) }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find district by admin id', error);
        }
    }


    // List all districts (directory)
    async findAll(): Promise<DistrictDocument[]> {
        try {
            return await this.districtModel.find().sort({ name: 1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list districts', error);
        }
    }


    // Update name/state
    async updateDetails(id: string, updates: { name?: string; state?: string }): Promise<DistrictDocument | null> {
        try {
            const updated = await this.districtModel.findByIdAndUpdate(id, updates, { new: true }).exec();
            if (!updated) {
                throw new NotFoundException(`District with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update district', error);
        }
    }


    // Assign/reassign the District Admin
    async setAdmin(districtId: string, userId: string): Promise<DistrictDocument | null> {
        try {
            return await this.districtModel.findByIdAndUpdate(
                districtId,
                { districtAdminId: new Types.ObjectId(userId) },
                { new: true },
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to assign district admin', error);
        }
    }


    // Clear the District Admin (e.g. that admin is being reassigned elsewhere)
    async unsetAdmin(districtId: string): Promise<void> {
        try {
            await this.districtModel.findByIdAndUpdate(districtId, { $unset: { districtAdminId: 1 } }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to clear district admin', error);
        }
    }


    // Deactivate district
    async deactivate(id: string): Promise<DistrictDocument | null> {
        try {
            const updated = await this.districtModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
            if (!updated) {
                throw new NotFoundException(`District with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to deactivate district', error);
        }
    }

}
