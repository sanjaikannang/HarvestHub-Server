import { Types } from 'mongoose';
import { UserRole } from 'src/utils/enum';
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DistrictService, RequestingUser } from 'src/services/district-service/district.service';
import { DistrictRepositoryService } from 'src/repositories/district-repository/district.repository';
import { CollectionCenterAddress } from 'src/schemas/CollectionCenter/collection-center.schema';
import { CollectionCenterRepositoryService } from 'src/repositories/collection-center-repository/collection-center.repository';

export interface CollectionCenterUpdateData {
    name?: string;
    address?: CollectionCenterAddress;
    contactPhone?: string;
    capacityKg?: number;
    isActive?: boolean;
}

@Injectable()
export class CollectionCenterService {
    constructor(
        private readonly collectionCenterRepositoryService: CollectionCenterRepositoryService,
        private readonly districtRepositoryService: DistrictRepositoryService,
        private readonly districtService: DistrictService,
    ) { }


    // Create Collection Center API Endpoint (Super Admin)
    async createCollectionCenterAPI(data: {
        districtId: string;
        name: string;
        address: CollectionCenterAddress;
        contactPhone: string;
        capacityKg?: number;
    }) {
        const district = await this.districtRepositoryService.findById(data.districtId);
        if (!district) {
            throw new NotFoundException('District not found');
        }
        if (!district.isActive) {
            throw new BadRequestException('Cannot add a collection center to an inactive district');
        }

        const collectionCenter = await this.collectionCenterRepositoryService.create({
            districtId: new Types.ObjectId(data.districtId),
            name: data.name,
            address: data.address,
            contactPhone: data.contactPhone,
            capacityKg: data.capacityKg,
            isActive: true,
        });

        return this.toSummary(collectionCenter);
    }


    // Update Collection Center API Endpoint (Super Admin: any, District Admin:
    // own district only, and cannot re-activate/deactivate)
    async updateCollectionCenterAPI(
        collectionCenterId: string,
        data: CollectionCenterUpdateData,
        requestingUser: RequestingUser,
    ) {
        const collectionCenter = await this.collectionCenterRepositoryService.findById(collectionCenterId);
        if (!collectionCenter) {
            throw new NotFoundException('Collection center not found');
        }

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            await this.districtService.assertOwnDistrict(requestingUser.sub, collectionCenter.districtId.toString());

            if (data.isActive !== undefined) {
                throw new ForbiddenException('Only a Super Admin can activate or deactivate a collection center');
            }
        }

        const updated = await this.collectionCenterRepositoryService.updateDetails(collectionCenterId, data);
        return this.toSummary(updated!);
    }


    // List Collection Centers API Endpoint (Super Admin: all or by districtId
    // query, District Admin: always scoped to their own district)
    async listCollectionCentersAPI(districtId: string | undefined, requestingUser: RequestingUser) {
        let scopedDistrictId = districtId;

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            const targetDistrictId = districtId;
            if (targetDistrictId) {
                await this.districtService.assertOwnDistrict(requestingUser.sub, targetDistrictId);
                scopedDistrictId = targetDistrictId;
            } else {
                scopedDistrictId = await this.districtService.resolveDistrictAdminDistrictId(requestingUser.sub);
            }
        }

        const collectionCenters = await this.collectionCenterRepositoryService.findAll(scopedDistrictId);
        return collectionCenters.map((collectionCenter) => this.toSummary(collectionCenter));
    }


    // Get Collection Center By Id API Endpoint (Super Admin: any, District
    // Admin: own district only)
    async getCollectionCenterByIdAPI(collectionCenterId: string, requestingUser: RequestingUser) {
        const collectionCenter = await this.collectionCenterRepositoryService.findById(collectionCenterId);
        if (!collectionCenter) {
            throw new NotFoundException('Collection center not found');
        }

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            await this.districtService.assertOwnDistrict(requestingUser.sub, collectionCenter.districtId.toString());
        }

        return this.toSummary(collectionCenter);
    }


    private toSummary(collectionCenter: {
        _id: Types.ObjectId;
        districtId: Types.ObjectId;
        name: string;
        address: CollectionCenterAddress;
        contactPhone: string;
        capacityKg?: number;
        isActive: boolean;
    }) {
        return {
            id: (collectionCenter._id as Types.ObjectId).toString(),
            districtId: collectionCenter.districtId.toString(),
            name: collectionCenter.name,
            address: collectionCenter.address,
            contactPhone: collectionCenter.contactPhone,
            capacityKg: collectionCenter.capacityKg,
            isActive: collectionCenter.isActive,
        };
    }

}
