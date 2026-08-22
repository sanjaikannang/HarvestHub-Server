import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DisputeStatus } from 'src/utils/enum';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Dispute, DisputeDocument } from 'src/schemas/Dispute/dispute.schema';

@Injectable()
export class DisputeRepositoryService {
    constructor(
        @InjectModel(Dispute.name) private disputeModel: Model<DisputeDocument>,
    ) { }


    async create(data: Partial<Dispute>): Promise<DisputeDocument> {
        try {
            const dispute = new this.disputeModel(data);
            return await dispute.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to create dispute', error);
        }
    }


    async findById(id: string): Promise<DisputeDocument | null> {
        try {
            return await this.disputeModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find dispute by id', error);
        }
    }


    // At most one dispute per order (see schema's unique index) — used both to
    // block a duplicate raise and to check for an existing one
    async findByOrderId(orderId: string): Promise<DisputeDocument | null> {
        try {
            return await this.disputeModel.findOne({ orderId: new Types.ObjectId(orderId) }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find dispute by order', error);
        }
    }


    async findByBuyerId(buyerId: string): Promise<DisputeDocument[]> {
        try {
            return await this.disputeModel.find({ buyerId: new Types.ObjectId(buyerId) }).sort({ raisedAt: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find disputes by buyer', error);
        }
    }


    // District-scoped oversight listing — joins through orders at the service
    // layer since Dispute doesn't carry districtId directly (same pattern as
    // PayoutRepositoryService.findByOrderIds)
    async findByOrderIds(orderIds: string[], status?: DisputeStatus): Promise<DisputeDocument[]> {
        try {
            const query: Record<string, unknown> = { orderId: { $in: orderIds.map((id) => new Types.ObjectId(id)) } };
            if (status) {
                query.status = status;
            }
            return await this.disputeModel.find(query).sort({ raisedAt: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list disputes', error);
        }
    }


    async updateStatus(
        id: string,
        status: DisputeStatus,
        fields: { resolvedBy?: Types.ObjectId; resolutionNotes?: string; refundAmount?: number; resolvedAt?: Date } = {},
    ): Promise<DisputeDocument | null> {
        try {
            const updated = await this.disputeModel.findByIdAndUpdate(id, { status, ...fields }, { new: true }).exec();
            if (!updated) {
                throw new NotFoundException(`Dispute with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update dispute status', error);
        }
    }

}
