import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Order, OrderDocument } from 'src/schemas/Order/order.schema';

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

}
