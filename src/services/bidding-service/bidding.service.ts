import { Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BiddingGateway } from 'src/gateways/bidding.gateway';
import { BiddingOutcome, BiddingSessionStatus, ProductStatus, UserRole } from 'src/utils/enum';
import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { RequestingUser } from 'src/services/district-service/district.service';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';
import { ProductRepositoryService } from 'src/repositories/product-repository/product.repository';
import { BidRepositoryService } from 'src/repositories/bid-repository/bid.repository';
import { BiddingSessionRepositoryService } from 'src/repositories/bidding-session-repository/bidding-session.repository';
import { BidDocument } from 'src/schemas/Bid/bid.schema';
import { BiddingSessionDocument } from 'src/schemas/BiddingSession/bidding-session.schema';

// TODO: configurable per category or globally, per requirement.md — a flat
// default until such config exists.
const DEFAULT_MIN_INCREMENT = 1;

@Injectable()
export class BiddingService {
    private readonly logger = new Logger(BiddingService.name);

    constructor(
        private readonly sessionRepositoryService: BiddingSessionRepositoryService,
        private readonly bidRepositoryService: BidRepositoryService,
        private readonly productRepositoryService: ProductRepositoryService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly biddingGateway: BiddingGateway,
    ) { }


    // Opens sessions for Listed products whose scheduled start time has
    // arrived — requirement.md: "opens automatically at the product's
    // scheduled bidding start time".
    @Cron(CronExpression.EVERY_10_SECONDS)
    async openDueSessions(): Promise<void> {
        const now = new Date();
        const dueProducts = await this.productRepositoryService.findDueForBidding(now);

        for (const product of dueProducts) {
            const productId = (product._id as Types.ObjectId).toString();

            const existing = await this.sessionRepositoryService.findByProductId(productId);
            if (existing) {
                continue; // already opened — defensive, shouldn't happen given the status filter
            }

            const session = await this.sessionRepositoryService.create({
                productId: product._id as Types.ObjectId,
                startTime: product.biddingStartTime,
                originalEndTime: product.biddingEndTime,
                currentEndTime: product.biddingEndTime,
                status: BiddingSessionStatus.LIVE,
                minIncrement: DEFAULT_MIN_INCREMENT,
                extensionCount: 0,
            });

            await this.productRepositoryService.updateDetails(productId, { status: ProductStatus.BIDDING_LIVE });

            this.biddingGateway.emitSessionStarted(productId, {
                sessionId: (session._id as Types.ObjectId).toString(),
                currentEndTime: session.currentEndTime,
                minIncrement: session.minIncrement,
            });

            this.logger.log(`Bidding session opened for product ${productId}`);
        }
    }


    // Closes sessions whose (possibly anti-sniping-extended) end time has
    // passed, and determines the outcome — requirement.md: highest bid wins →
    // Sold; zero bids → Unsold, returned to the Farmer for relisting.
    @Cron(CronExpression.EVERY_10_SECONDS)
    async closeDueSessions(): Promise<void> {
        const now = new Date();
        const dueSessions = await this.sessionRepositoryService.findDueToClose(now);

        for (const session of dueSessions) {
            const productId = session.productId.toString();
            const sessionId = (session._id as Types.ObjectId).toString();
            const outcome = session.currentHighestBid ? BiddingOutcome.SOLD : BiddingOutcome.UNSOLD;

            await this.sessionRepositoryService.markEnded(
                sessionId,
                outcome,
                outcome === BiddingOutcome.SOLD
                    ? { winnerId: session.currentHighestBid!.bidderId, winningBidAmount: session.currentHighestBid!.amount }
                    : {},
            );

            // TODO: on Sold, this is where the post-win payment window opens
            // and, on non-payment, the cascade to the next-highest bidder
            // (Payment & Escrow, module 07, not built) — for now the product
            // moves straight to its final Sold/Unsold status.
            await this.productRepositoryService.updateDetails(productId, {
                status: outcome === BiddingOutcome.SOLD ? ProductStatus.SOLD : ProductStatus.UNSOLD,
            });

            this.biddingGateway.emitSessionEnded(productId, {
                sessionId,
                outcome,
                winnerId: session.currentHighestBid?.bidderId?.toString(),
                winningBidAmount: session.currentHighestBid?.amount,
            });

            this.logger.log(`Bidding session closed for product ${productId} — ${outcome}`);
        }
    }


    // Get Session By Product Id API Endpoint (Farmer: own product only; Buyer/Admin: open)
    async getSessionByProductIdAPI(productId: string, requestingUser: RequestingUser) {
        const session = await this.sessionRepositoryService.findByProductId(productId);
        if (!session) {
            throw new NotFoundException('No bidding session for this product');
        }

        await this.assertCanViewSession(productId, requestingUser);

        return this.toSummary(session);
    }


    // Bid History API Endpoint — same access as the session itself
    async listBidHistoryAPI(productId: string, requestingUser: RequestingUser) {
        const session = await this.sessionRepositoryService.findByProductId(productId);
        if (!session) {
            throw new NotFoundException('No bidding session for this product');
        }

        await this.assertCanViewSession(productId, requestingUser);

        const bids = await this.bidRepositoryService.findBySessionId((session._id as Types.ObjectId).toString());
        return bids.map((bid) => this.toBidSummary(bid));
    }


    // Place Bid API Endpoint (Buyer — verified phone required)
    async placeBidAPI(productId: string, buyerId: string, amount: number) {
        const session = await this.sessionRepositoryService.findByProductId(productId);
        if (!session) {
            throw new NotFoundException('No bidding session for this product');
        }
        if (session.status !== BiddingSessionStatus.LIVE) {
            throw new BadRequestException('This bidding session is not currently live');
        }

        const buyer = await this.userRepositoryService.findById(buyerId);
        if (!buyer?.isPhoneVerified) {
            throw new ForbiddenException('Verify your phone number before placing a bid');
        }
        // TODO: also require a verified delivery address once BuyerProfile
        // (database/buyer-profiles.md, not built) exists — requirement.md:
        // "Only Buyers with verified phone + verified delivery address may place bids".

        const product = await this.productRepositoryService.findById(productId);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const floor = product.finalStartingPrice ?? product.startingPrice;
        const minRequired = session.currentHighestBid ? session.currentHighestBid.amount + session.minIncrement : floor;
        if (amount < minRequired) {
            throw new BadRequestException(`Bid must be at least ${minRequired}`);
        }

        const bidId = new Types.ObjectId();
        const placedAt = new Date();
        const sessionId = (session._id as Types.ObjectId).toString();

        // Atomic, race-condition-safe against the current highest bid — see
        // BiddingSessionRepositoryService.tryPlaceBid. A null result means
        // someone else's bid won the race between our read and our write.
        const updatedSession = await this.sessionRepositoryService.tryPlaceBid(sessionId, amount, buyerId, bidId, placedAt);
        if (!updatedSession) {
            throw new ConflictException('Someone just placed a higher bid — refresh and try again');
        }

        await this.bidRepositoryService.create({
            _id: bidId,
            sessionId: session._id as Types.ObjectId,
            productId: product._id as Types.ObjectId,
            buyerId: new Types.ObjectId(buyerId),
            amount,
            placedAt,
        });

        this.biddingGateway.emitBidPlaced(productId, {
            amount,
            bidderId: buyerId,
            currentEndTime: updatedSession.currentEndTime,
            extensionCount: updatedSession.extensionCount,
        });

        return this.toSummary(updatedSession);
    }


    // List My Bids API Endpoint (Buyer)
    async listMyBidsAPI(buyerId: string) {
        const bids = await this.bidRepositoryService.findByBuyerId(buyerId);
        return bids.map((bid) => this.toBidSummary(bid));
    }


    // Farmers may only see their own product's session; every other role
    // (Buyer, District Admin, Super Admin, Inspector) can view freely — a
    // live session is effectively public marketplace information.
    private async assertCanViewSession(productId: string, requestingUser: RequestingUser): Promise<void> {
        if (requestingUser.role !== UserRole.FARMER) {
            return;
        }

        const product = await this.productRepositoryService.findById(productId);
        if (product?.farmerId.toString() !== requestingUser.sub) {
            throw new ForbiddenException('You do not have access to this bidding session');
        }
    }


    private toSummary(session: BiddingSessionDocument) {
        return {
            id: (session._id as Types.ObjectId).toString(),
            productId: session.productId.toString(),
            startTime: session.startTime,
            originalEndTime: session.originalEndTime,
            currentEndTime: session.currentEndTime,
            status: session.status,
            minIncrement: session.minIncrement,
            currentHighestBid: session.currentHighestBid
                ? {
                    amount: session.currentHighestBid.amount,
                    bidderId: session.currentHighestBid.bidderId.toString(),
                    bidId: session.currentHighestBid.bidId.toString(),
                }
                : undefined,
            extensionCount: session.extensionCount,
            winnerId: session.winnerId?.toString(),
            winningBidAmount: session.winningBidAmount,
            outcome: session.outcome,
        };
    }

    private toBidSummary(bid: BidDocument) {
        return {
            id: (bid._id as Types.ObjectId).toString(),
            sessionId: bid.sessionId.toString(),
            productId: bid.productId.toString(),
            buyerId: bid.buyerId.toString(),
            amount: bid.amount,
            placedAt: bid.placedAt,
        };
    }

}
