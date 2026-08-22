import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentStatus } from 'src/utils/enum';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Payment, PaymentDocument } from 'src/schemas/Payment/payment.schema';

const ACTIVE_STATUSES = [PaymentStatus.INITIATED, PaymentStatus.PROCESSING];

@Injectable()
export class PaymentRepositoryService {
    constructor(
        @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    ) { }


    // Create a payment attempt — the original winner's, or a cascaded offer
    async create(data: Partial<Payment>): Promise<PaymentDocument> {
        try {
            const payment = new this.paymentModel(data);
            return await payment.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to create payment', error);
        }
    }


    async findById(id: string): Promise<PaymentDocument | null> {
        try {
            return await this.paymentModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find payment by id', error);
        }
    }


    async findByRazorpayOrderId(razorpayOrderId: string): Promise<PaymentDocument | null> {
        try {
            return await this.paymentModel.findOne({ razorpayOrderId }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find payment by razorpay order id', error);
        }
    }


    // The currently-open attempt for a session (there's at most one at a time
    // — a new one is only created once the prior attempt reaches a terminal
    // status, see BiddingCascadeService)
    async findActiveBySessionId(sessionId: string): Promise<PaymentDocument | null> {
        try {
            return await this.paymentModel.findOne({
                sessionId: new Types.ObjectId(sessionId),
                status: { $in: ACTIVE_STATUSES },
            }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find active payment by session', error);
        }
    }


    // Every attempt ever made for a session — used to know which buyers have
    // already had (and lost) their turn when cascading
    async findAllBySessionId(sessionId: string): Promise<PaymentDocument[]> {
        try {
            return await this.paymentModel.find({ sessionId: new Types.ObjectId(sessionId) }).sort({ initiatedAt: 1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find payments by session', error);
        }
    }


    // Open attempts whose window has passed — the expiry sweep's queue
    async findDueForExpiry(now: Date): Promise<PaymentDocument[]> {
        try {
            return await this.paymentModel.find({
                status: { $in: ACTIVE_STATUSES },
                paymentWindowExpiresAt: { $lte: now },
            }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find payments due for expiry', error);
        }
    }


    // Open attempts entering their reminder window (paymentWindowExpiresAt
    // within thresholdMs) that haven't already been reminded — see
    // NotificationService's payment-window-reminder cron
    async findDueForReminder(now: Date, thresholdMs: number): Promise<PaymentDocument[]> {
        try {
            return await this.paymentModel.find({
                status: { $in: ACTIVE_STATUSES },
                reminderSent: false,
                paymentWindowExpiresAt: { $lte: new Date(now.getTime() + thresholdMs), $gt: now },
            }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find payments due for a reminder', error);
        }
    }


    async markReminderSent(id: string): Promise<void> {
        try {
            await this.paymentModel.updateOne({ _id: id }, { reminderSent: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to mark payment reminder sent', error);
        }
    }


    async findByBuyerId(buyerId: string): Promise<PaymentDocument[]> {
        try {
            return await this.paymentModel.find({ buyerId: new Types.ObjectId(buyerId) }).sort({ initiatedAt: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find payments by buyer', error);
        }
    }


    // Set the Razorpay order id + delivery address once checkout is initiated
    async markProcessing(id: string, razorpayOrderId: string, deliveryAddress: Payment['deliveryAddress']): Promise<PaymentDocument | null> {
        try {
            const updated = await this.paymentModel.findByIdAndUpdate(
                id,
                { status: PaymentStatus.PROCESSING, razorpayOrderId, deliveryAddress },
                { new: true },
            ).exec();
            if (!updated) {
                throw new NotFoundException(`Payment with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to mark payment processing', error);
        }
    }


    // Terminal transition — successful/failed/expired
    async markTerminal(
        id: string,
        status: PaymentStatus.SUCCESSFUL | PaymentStatus.FAILED | PaymentStatus.EXPIRED,
        fields: { razorpayPaymentId?: string } = {},
    ): Promise<PaymentDocument | null> {
        try {
            const updated = await this.paymentModel.findByIdAndUpdate(
                id,
                { status, completedAt: new Date(), ...fields },
                { new: true },
            ).exec();
            if (!updated) {
                throw new NotFoundException(`Payment with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to close out payment', error);
        }
    }

}
