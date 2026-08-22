import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PayoutStatus } from 'src/utils/enum';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Payout, PayoutDocument } from 'src/schemas/Payout/payout.schema';

@Injectable()
export class PayoutRepositoryService {
    constructor(
        @InjectModel(Payout.name) private payoutModel: Model<PayoutDocument>,
    ) { }


    // Created alongside the Order, status `pending` (see PaymentService.verifyPaymentAPI)
    async create(data: Partial<Payout>): Promise<PayoutDocument> {
        try {
            const payout = new this.payoutModel(data);
            return await payout.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to create payout', error);
        }
    }


    async findById(id: string): Promise<PayoutDocument | null> {
        try {
            return await this.payoutModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find payout by id', error);
        }
    }


    async findByOrderId(orderId: string): Promise<PayoutDocument | null> {
        try {
            return await this.payoutModel.findOne({ orderId: new Types.ObjectId(orderId) }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find payout by order', error);
        }
    }


    async findByFarmerId(farmerId: string): Promise<PayoutDocument[]> {
        try {
            return await this.payoutModel.find({ farmerId: new Types.ObjectId(farmerId) }).sort({ createdAt: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find payouts by farmer', error);
        }
    }


    // District-scoped oversight listing — joins through orders at the service
    // layer since Payout doesn't carry districtId directly
    async findByOrderIds(orderIds: string[]): Promise<PayoutDocument[]> {
        try {
            return await this.payoutModel.find({ orderId: { $in: orderIds.map((id) => new Types.ObjectId(id)) } }).sort({ createdAt: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list payouts', error);
        }
    }


    async release(id: string): Promise<PayoutDocument | null> {
        try {
            const updated = await this.payoutModel.findByIdAndUpdate(
                id,
                { status: PayoutStatus.RELEASED, releasedAt: new Date() },
                { new: true },
            ).exec();
            if (!updated) {
                throw new NotFoundException(`Payout with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to release payout', error);
        }
    }


    // Full-refund dispute resolution — claws back the whole payout (see
    // DisputeService.resolveDisputeAPI)
    async reverse(id: string, reason: string): Promise<PayoutDocument | null> {
        try {
            const updated = await this.payoutModel.findByIdAndUpdate(
                id,
                { status: PayoutStatus.REVERSED, holdReason: reason },
                { new: true },
            ).exec();
            if (!updated) {
                throw new NotFoundException(`Payout with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to reverse payout', error);
        }
    }


    // Partial-refund dispute resolution — reduces the net payout without
    // changing its status (see DisputeService.resolveDisputeAPI)
    async adjustNetAmount(id: string, newNetAmount: number, reason: string): Promise<PayoutDocument | null> {
        try {
            const updated = await this.payoutModel.findByIdAndUpdate(
                id,
                { netPayoutAmount: newNetAmount, holdReason: reason },
                { new: true },
            ).exec();
            if (!updated) {
                throw new NotFoundException(`Payout with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to adjust payout amount', error);
        }
    }

}
