import { Types } from 'mongoose';
import { UserRole } from 'src/utils/enum';
import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { DistrictRepositoryService } from 'src/repositories/district-repository/district.repository';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';

export interface RequestingUser {
    sub: string;
    role: UserRole;
}

@Injectable()
export class DistrictService {
    constructor(
        private readonly districtRepositoryService: DistrictRepositoryService,
        private readonly userRepositoryService: UserRepositoryService,
    ) { }


    // Create District API Endpoint (Super Admin)
    async createDistrictAPI(data: { name: string; state: string }) {
        const existing = await this.districtRepositoryService.findByNameAndState(data.name, data.state);
        if (existing) {
            throw new ConflictException('A district with this name already exists in this state');
        }

        const district = await this.districtRepositoryService.create({
            name: data.name,
            state: data.state,
            isActive: true,
        });

        return this.toSummary(district);
    }


    // Update District API Endpoint (Super Admin) — name/state only
    async updateDistrictAPI(districtId: string, data: { name?: string; state?: string }) {
        const district = await this.districtRepositoryService.findById(districtId);
        if (!district) {
            throw new NotFoundException('District not found');
        }

        if (data.name || data.state) {
            const nextName = data.name ?? district.name;
            const nextState = data.state ?? district.state;
            const existing = await this.districtRepositoryService.findByNameAndState(nextName, nextState);
            if (existing && (existing._id as Types.ObjectId).toString() !== districtId) {
                throw new ConflictException('A district with this name already exists in this state');
            }
        }

        const updated = await this.districtRepositoryService.updateDetails(districtId, data);
        return this.toSummary(updated!);
    }


    // Deactivate District API Endpoint (Super Admin)
    async deactivateDistrictAPI(districtId: string) {
        const district = await this.districtRepositoryService.findById(districtId);
        if (!district) {
            throw new NotFoundException('District not found');
        }

        if (!district.isActive) {
            throw new BadRequestException('District is already inactive');
        }

        // TODO: once Catalog Management (module 03) exists, block deactivation
        // while this district has products in an active (non-terminal)
        // lifecycle state — see modules/02-district-management/requirement.md.

        const updated = await this.districtRepositoryService.deactivate(districtId);
        return this.toSummary(updated!);
    }


    // Assign/Reassign District Admin API Endpoint (Super Admin) — maintains the
    // 1 district <-> 1 primary District Admin invariant from both sides.
    async assignDistrictAdminAPI(districtId: string, userId: string) {
        const district = await this.districtRepositoryService.findById(districtId);
        if (!district) {
            throw new NotFoundException('District not found');
        }

        const user = await this.userRepositoryService.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role !== UserRole.DISTRICT_ADMIN) {
            throw new BadRequestException('Only a user with the DISTRICT_ADMIN role can be assigned as a district admin');
        }

        const alreadyAdminOfThis = district.districtAdminId?.toString() === userId;
        if (alreadyAdminOfThis) {
            return this.toSummary(district);
        }

        // Free the district this admin currently administers, if any
        const currentDistrict = await this.districtRepositoryService.findByDistrictAdminId(userId);
        if (currentDistrict) {
            await this.districtRepositoryService.unsetAdmin((currentDistrict._id as Types.ObjectId).toString());
        }

        // Free the previous admin of this district, if any
        if (district.districtAdminId) {
            await this.userRepositoryService.clearUserDistrict(district.districtAdminId.toString());
        }

        const updated = await this.districtRepositoryService.setAdmin(districtId, userId);
        await this.userRepositoryService.updateUser(userId, { districtId: new Types.ObjectId(districtId) });

        return this.toSummary(updated!);
    }


    // District Directory API Endpoint (Super Admin) — all districts with
    // summary stats
    async getDistrictDirectoryAPI() {
        const districts = await this.districtRepositoryService.findAll();

        return await Promise.all(
            districts.map(async (district) => {
                const districtId = (district._id as Types.ObjectId).toString();

                const [activeFarmers, activeBuyers] = await Promise.all([
                    this.userRepositoryService.countActiveByDistrictAndRole(districtId, UserRole.FARMER),
                    this.userRepositoryService.countActiveByDistrictAndRole(districtId, UserRole.BUYER),
                ]);

                return {
                    ...this.toSummary(district),
                    stats: {
                        activeFarmers,
                        activeBuyers,
                        // TODO: wire up once Catalog Management (module 03) and
                        // Order/Delivery Management (module 08) exist.
                        productsInPipeline: 0,
                        ordersInProgress: 0,
                    },
                };
            }),
        );
    }


    // Get District By Id API Endpoint (Super Admin: any, District Admin: own district only)
    async getDistrictByIdAPI(districtId: string, requestingUser: RequestingUser) {
        const district = await this.districtRepositoryService.findById(districtId);
        if (!district) {
            throw new NotFoundException('District not found');
        }

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            await this.assertOwnDistrict(requestingUser.sub, districtId);
        }

        return this.toSummary(district);
    }


    // Resolve a District Admin's own districtId, throwing if they haven't been
    // assigned to one yet — shared by the district and collection center
    // services for scoping DISTRICT_ADMIN access.
    async resolveDistrictAdminDistrictId(districtAdminUserId: string): Promise<string> {
        const admin = await this.userRepositoryService.findById(districtAdminUserId);
        if (!admin?.districtId) {
            throw new ForbiddenException('You have not been assigned to a district yet');
        }
        return admin.districtId.toString();
    }


    // Throw unless the given district is the District Admin's own district
    async assertOwnDistrict(districtAdminUserId: string, districtId: string): Promise<void> {
        const ownDistrictId = await this.resolveDistrictAdminDistrictId(districtAdminUserId);
        if (ownDistrictId !== districtId) {
            throw new ForbiddenException('You do not have access to this district');
        }
    }


    // The reverse lookup — a district's assigned admin, if any. Shared by
    // every module that needs to alert the District Admin about something
    // happening in their district (see NotificationService call sites).
    async getDistrictAdminUserId(districtId: string): Promise<string | undefined> {
        const district = await this.districtRepositoryService.findById(districtId);
        return district?.districtAdminId?.toString();
    }


    private toSummary(district: { _id: Types.ObjectId; name: string; state: string; districtAdminId?: Types.ObjectId; isActive: boolean }) {
        return {
            id: (district._id as Types.ObjectId).toString(),
            name: district.name,
            state: district.state,
            districtAdminId: district.districtAdminId?.toString(),
            isActive: district.isActive,
        };
    }

}
