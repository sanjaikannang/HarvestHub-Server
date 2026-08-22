import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Bid, BidDocument } from 'src/schemas/Bid/bid.schema';

@Injectable()
export class BidRepositoryService {
    constructor(
        @InjectModel(Bid.name) private bidModel: Model<BidDocument>,
    ) { }


    // Log a bid — only ever called after BiddingSessionRepositoryService.tryPlaceBid
    // succeeds, using the same pre-generated id (see BiddingService.placeBidAPI)
    async create(data: Partial<Bid> & { _id: Types.ObjectId }): Promise<BidDocument> {
        try {
            const bid = new this.bidModel(data);
            return await bid.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to log bid', error);
        }
    }


    // Full bid history for a session — highest first, earliest-received breaks ties
    // (also the cascade order once Payment/Escrow, module 07, needs it)
    async findBySessionId(sessionId: string): Promise<BidDocument[]> {
        try {
            return await this.bidModel.find({ sessionId: new Types.ObjectId(sessionId) }).sort({ amount: -1, placedAt: 1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list bids by session', error);
        }
    }


    // A buyer's own bid history across all sessions
    async findByBuyerId(buyerId: string): Promise<BidDocument[]> {
        try {
            return await this.bidModel.find({ buyerId: new Types.ObjectId(buyerId) }).sort({ placedAt: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list bids by buyer', error);
        }
    }

}
