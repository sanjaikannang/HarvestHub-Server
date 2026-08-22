import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DeliveryStatus } from 'src/utils/enum';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Order, OrderDocument, DeliveryStatusHistoryEntry } from 'src/schemas/Order/order.schema';

@Injectable()
export class OrderRepositoryService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    ) { }


    // Created once, on successful payment (see PaymentService.verifyPaymentAPI)
    async create(data: Partial<Order>): Promise<OrderDocument> {
        try {
            const order = new this.orderModel(data);
            return await order.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to create order', error);
        }
    }


    async findById(id: string): Promise<OrderDocument | null> {
        try {
            return await this.orderModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find order by id', error);
        }
    }


    async findByPaymentId(paymentId: string): Promise<OrderDocument | null> {
        try {
            return await this.orderModel.findOne({ paymentId: new Types.ObjectId(paymentId) }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find order by payment', error);
        }
    }


    async findByBuyerId(buyerId: string): Promise<OrderDocument[]> {
        try {
            return await this.orderModel.find({ buyerId: new Types.ObjectId(buyerId) }).sort({ createdAt: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find orders by buyer', error);
        }
    }


    async findByFarmerId(farmerId: string): Promise<OrderDocument[]> {
        try {
            return await this.orderModel.find({ farmerId: new Types.ObjectId(farmerId) }).sort({ createdAt: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find orders by farmer', error);
        }
    }


    // District-scoped listing for oversight (District Admin/Super Admin)
    async findAll(filter: { districtId?: string }): Promise<OrderDocument[]> {
        try {
            const query: Record<string, unknown> = {};
            if (filter.districtId) {
                query.districtId = new Types.ObjectId(filter.districtId);
            }
            return await this.orderModel.find(query).sort({ createdAt: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list orders', error);
        }
    }


    // Platform-wide order count — backs the Super Admin dashboard's totals
    // (see Admin Dashboard & Reporting, module 11)
    async countAll(): Promise<number> {
        try {
            return await this.orderModel.countDocuments({}).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to count orders', error);
        }
    }


    // Sum of every order's totalAmount — an Order only ever exists after a
    // successful payment, so this is exactly the platform's completed-sales
    // revenue (see Admin Dashboard & Reporting, module 11)
    async getTotalRevenue(): Promise<number> {
        try {
            const result = await this.orderModel.aggregate([
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]).exec();
            return result[0]?.total ?? 0;
        } catch (error) {
            throw new InternalServerErrorException('Failed to compute total revenue', error);
        }
    }


    async findByDeliveryPartnerId(deliveryPartnerId: string): Promise<OrderDocument[]> {
        try {
            return await this.orderModel.find({ deliveryPartnerId: new Types.ObjectId(deliveryPartnerId) }).sort({ createdAt: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find orders by delivery partner', error);
        }
    }


    // Set on auto-assignment (Payment success) or manual reassignment (District
    // Admin/Super Admin) — see database/orders.md
    async assignDeliveryPartner(orderId: string, deliveryPartnerId: string): Promise<OrderDocument | null> {
        try {
            return await this.orderModel.findByIdAndUpdate(
                orderId,
                { deliveryPartnerId: new Types.ObjectId(deliveryPartnerId) },
                { new: true },
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to assign delivery partner', error);
        }
    }


    // Advances the delivery status and appends to the history array in one
    // atomic write — see OrderService.updateOrderStatusAPI
    async updateDeliveryStatus(orderId: string, status: DeliveryStatus, historyEntry: DeliveryStatusHistoryEntry): Promise<OrderDocument | null> {
        try {
            return await this.orderModel.findByIdAndUpdate(
                orderId,
                { deliveryStatus: status, $push: { deliveryStatusHistory: historyEntry } },
                { new: true },
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to update delivery status', error);
        }
    }

}
