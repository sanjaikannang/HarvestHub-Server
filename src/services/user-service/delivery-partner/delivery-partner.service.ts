import { Types } from 'mongoose';
import { DeliveryPartnerAvailability } from 'src/utils/enum';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';
import { DeliveryPartnerProfileRepositoryService } from 'src/repositories/delivery-partner-profile-repository/delivery-partner-profile.repository';

@Injectable()
export class DeliveryPartnerService {
    constructor(
        private readonly userRepositoryService: UserRepositoryService,
        private readonly deliveryPartnerProfileRepositoryService: DeliveryPartnerProfileRepositoryService,
    ) { }


    // Get My Profile API Endpoint — the authenticated delivery partner's own
    // profile, merged with their DeliveryPartnerProfile (service coverage,
    // vehicle info, live availability) — see database/delivery-partner-profiles.md.
    async getMyProfileAPI(userId: string) {
        const user = await this.userRepositoryService.findById(userId);
        if (!user) {
            throw new NotFoundException('Delivery partner profile not found');
        }

        const profile = await this.deliveryPartnerProfileRepositoryService.findByUserId(userId);

        return {
            id: (user._id as Types.ObjectId).toString(),
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
            districtId: user.districtId?.toString(),
            preferredLanguage: user.preferredLanguage,
            isPhoneVerified: user.isPhoneVerified,
            districtsServiced: profile?.districtsServiced.map((id) => id.toString()),
            vehicleType: profile?.vehicleType,
            vehicleNumber: profile?.vehicleNumber,
            capacityKg: profile?.capacityKg,
            currentStatus: profile?.currentStatus,
            activeOrderCount: profile?.activeOrderCount,
            rating: profile?.rating,
        };
    }


    // Update Availability API Endpoint — the delivery partner toggles their
    // own availability; only `available` partners are matched by auto-assignment
    async updateAvailabilityAPI(userId: string, status: DeliveryPartnerAvailability) {
        const updated = await this.deliveryPartnerProfileRepositoryService.updateAvailability(userId, status);
        if (!updated) {
            throw new NotFoundException('Delivery partner profile not found');
        }

        return { currentStatus: updated.currentStatus };
    }

}
