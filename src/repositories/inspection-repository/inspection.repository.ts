import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AdminDecision, RecommendedVerdict } from 'src/utils/enum';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Inspection, InspectionDocument } from 'src/schemas/Inspection/inspection.schema';


@Injectable()
export class InspectionRepositoryService {
    constructor(
        @InjectModel(Inspection.name) private inspectionModel: Model<InspectionDocument>,
    ) { }


    // Create inspection (scheduling)
    async create(data: Partial<Inspection>): Promise<InspectionDocument> {
        try {
            const inspection = new this.inspectionModel(data);
            return await inspection.save();
        } catch (error) {
            throw new InternalServerErrorException('Failed to create inspection', error);
        }
    }


    // Find inspection by id
    async findById(id: string): Promise<InspectionDocument | null> {
        try {
            return await this.inspectionModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find inspection by id', error);
        }
    }


    // Find the most recent inspection for a product
    async findLatestByProductId(productId: string): Promise<InspectionDocument | null> {
        try {
            return await this.inspectionModel.findOne({ productId: new Types.ObjectId(productId) }).sort({ createdAt: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find inspection by product', error);
        }
    }


    // List inspections for a district's review queue (Super Admin: districtId omitted for all)
    async findAll(filter: { districtId?: string }): Promise<InspectionDocument[]> {
        try {
            const query: Record<string, unknown> = {};
            if (filter.districtId) {
                query.districtId = new Types.ObjectId(filter.districtId);
            }
            return await this.inspectionModel.find(query).sort({ scheduledDate: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list inspections', error);
        }
    }


    // List an inspector's assigned visits
    async findByInspectorId(inspectorId: string): Promise<InspectionDocument[]> {
        try {
            return await this.inspectionModel.find({ inspectorId: new Types.ObjectId(inspectorId) }).sort({ scheduledDate: -1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to list inspections by inspector', error);
        }
    }


    // Record the inspector's findings
    async recordFindings(
        id: string,
        data: {
            verifiedQuantity: number;
            qualityGrade: string;
            conditionNotes?: string;
            inspectionPhotos?: string[];
            recommendedVerdict: RecommendedVerdict;
        },
    ): Promise<InspectionDocument | null> {
        try {
            const updated = await this.inspectionModel.findByIdAndUpdate(
                id,
                { ...data, visitedAt: new Date() },
                { new: true },
            ).exec();
            if (!updated) {
                throw new NotFoundException(`Inspection with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to record inspection findings', error);
        }
    }


    // Record the district admin's final decision
    async recordDecision(
        id: string,
        adminDecision: AdminDecision,
        decidedBy: string,
        adminDecisionReason?: string,
    ): Promise<InspectionDocument | null> {
        try {
            const updated = await this.inspectionModel.findByIdAndUpdate(
                id,
                {
                    adminDecision,
                    decidedBy: new Types.ObjectId(decidedBy),
                    decidedAt: new Date(),
                    ...(adminDecisionReason ? { adminDecisionReason } : {}),
                },
                { new: true },
            ).exec();
            if (!updated) {
                throw new NotFoundException(`Inspection with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to record inspection decision', error);
        }
    }

}
