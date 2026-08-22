import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BiddingOutcome, BiddingSessionStatus } from 'src/utils/enum';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { BiddingSession, BiddingSessionDocument } from 'src/schemas/BiddingSession/bidding-session.schema';

const ANTI_SNIPING_WINDOW_MS = 30 * 1000;
const ANTI_SNIPING_EXTENSION_MS = 30 * 1000;

@Injectable()
export class BiddingSessionRepositoryService {
    constructor(
        @InjectModel(BiddingSession.name) private sessionModel: Model<BiddingSessionDocument>,
    ) { }


    // Create session (opened by the scheduler — see BiddingService)
    async create(data: Partial<BiddingSession>): Promise<BiddingSessionDocument> {
        try {
            const session = new this.sessionModel(data);
            return await session.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to create bidding session', error);
        }
    }


    // Find the (1:1) session for a product
    async findByProductId(productId: string): Promise<BiddingSessionDocument | null> {
        try {
            return await this.sessionModel.findOne({ productId: new Types.ObjectId(productId) }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find bidding session by product', error);
        }
    }


    // Find by id
    async findById(id: string): Promise<BiddingSessionDocument | null> {
        try {
            return await this.sessionModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find bidding session by id', error);
        }
    }


    // Live sessions whose current end time has passed — the scheduler's close queue
    async findDueToClose(now: Date): Promise<BiddingSessionDocument[]> {
        try {
            return await this.sessionModel.find({ status: BiddingSessionStatus.LIVE, currentEndTime: { $lte: now } }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find bidding sessions due to close', error);
        }
    }


    // Atomically place a bid: only succeeds if the session is still live and
    // this amount still beats whatever is currently the highest (re-checked
    // against the live document, not the caller's possibly-stale read) — the
    // race-condition-safety business rule from requirement.md. Anti-sniping:
    // if the bid lands within the last 30s of the current end time, extends it
    // by another 30s in the same atomic update.
    async tryPlaceBid(
        sessionId: string,
        amount: number,
        bidderId: string,
        bidId: Types.ObjectId,
        placedAt: Date,
    ): Promise<BiddingSessionDocument | null> {
        try {
            return await this.sessionModel.findOneAndUpdate(
                {
                    _id: sessionId,
                    status: BiddingSessionStatus.LIVE,
                    $or: [
                        { currentHighestBid: { $exists: false } },
                        { 'currentHighestBid.amount': { $lt: amount } },
                    ],
                },
                [
                    {
                        $set: {
                            currentHighestBid: { amount, bidderId: new Types.ObjectId(bidderId), bidId },
                            currentEndTime: {
                                $cond: [
                                    { $lte: [{ $subtract: ['$currentEndTime', placedAt] }, ANTI_SNIPING_WINDOW_MS] },
                                    { $add: ['$currentEndTime', ANTI_SNIPING_EXTENSION_MS] },
                                    '$currentEndTime',
                                ],
                            },
                            extensionCount: {
                                $cond: [
                                    { $lte: [{ $subtract: ['$currentEndTime', placedAt] }, ANTI_SNIPING_WINDOW_MS] },
                                    { $add: ['$extensionCount', 1] },
                                    '$extensionCount',
                                ],
                            },
                        },
                    },
                ],
                { new: true },
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to place bid', error);
        }
    }


    // Mark a session live (scheduler opening it at the product's scheduled start time)
    async markLive(id: string): Promise<void> {
        try {
            await this.sessionModel.findByIdAndUpdate(id, { status: BiddingSessionStatus.LIVE }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to mark bidding session live', error);
        }
    }


    // Close a session with its final outcome
    async markEnded(
        id: string,
        outcome: BiddingOutcome,
        fields: { winnerId?: Types.ObjectId; winningBidAmount?: number } = {},
    ): Promise<BiddingSessionDocument | null> {
        try {
            const updated = await this.sessionModel.findByIdAndUpdate(
                id,
                { status: BiddingSessionStatus.ENDED, outcome, ...fields },
                { new: true },
            ).exec();
            if (!updated) {
                throw new NotFoundException(`Bidding session with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to close bidding session', error);
        }
    }

}
