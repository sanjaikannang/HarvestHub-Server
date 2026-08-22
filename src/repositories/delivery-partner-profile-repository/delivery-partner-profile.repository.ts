import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DeliveryPartnerAvailability } from 'src/utils/enum';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DeliveryPartnerProfile, DeliveryPartnerProfileDocument } from 'src/schemas/DeliveryPartnerProfile/delivery-partner-profile.schema';

@Injectable()
export class DeliveryPartnerProfileRepositoryService {
    constructor(
        @InjectModel(DeliveryPartnerProfile.name) private profileModel: Model<DeliveryPartnerProfileDocument>,
    ) { }


    // Created alongside the User account (see AuthService.createDeliveryPartnerAPI)
    async create(data: Partial<DeliveryPartnerProfile>): Promise<DeliveryPartnerProfileDocument> {
        try {
            const profile = new this.profileModel(data);
            return await profile.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to create delivery partner profile', error);
        }
    }


    async findByUserId(userId: string): Promise<DeliveryPartnerProfileDocument | null> {
        try {
            return await this.profileModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find delivery partner profile', error);
        }
    }


    // Auto-assignment match: available partners covering the district, least-loaded first
    async findLeastLoadedAvailable(districtId: string): Promise<DeliveryPartnerProfileDocument | null> {
        try {
            return await this.profileModel
                .findOne({ districtsServiced: new Types.ObjectId(districtId), currentStatus: DeliveryPartnerAvailability.AVAILABLE })
                .sort({ activeOrderCount: 1 })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find an available delivery partner', error);
        }
    }


    async incrementActiveOrderCount(userId: string): Promise<void> {
        try {
            await this.profileModel.updateOne({ userId: new Types.ObjectId(userId) }, { $inc: { activeOrderCount: 1 } }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to increment active order count', error);
        }
    }


    // Floors at 0 via an aggregation-pipeline update — a delivery partner
    // should never show a negative active order count
    async decrementActiveOrderCount(userId: string): Promise<void> {
        try {
            await this.profileModel.updateOne(
                { userId: new Types.ObjectId(userId) },
                [{ $set: { activeOrderCount: { $max: [0, { $subtract: ['$activeOrderCount', 1] }] } } }],
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to decrement active order count', error);
        }
    }


    async updateAvailability(userId: string, status: DeliveryPartnerAvailability): Promise<DeliveryPartnerProfileDocument | null> {
        try {
            return await this.profileModel.findOneAndUpdate({ userId: new Types.ObjectId(userId) }, { currentStatus: status }, { new: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to update delivery partner availability', error);
        }
    }

}
