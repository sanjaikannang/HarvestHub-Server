import { Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';

@Injectable()
export class FarmerService {
    constructor(
        private readonly userRepositoryService: UserRepositoryService,
    ) { }


    // Get My Profile API Endpoint — the authenticated farmer's own profile.
    // Extend this once a dedicated FarmerProfile schema exists (see
    // database/farmer-profiles.md) — for now it's just the base User fields.
    async getMyProfileAPI(userId: string) {
        const user = await this.userRepositoryService.findById(userId);
        if (!user) {
            throw new NotFoundException('Farmer profile not found');
        }

        return {
            id: (user._id as Types.ObjectId).toString(),
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
            districtId: user.districtId?.toString(),
            preferredLanguage: user.preferredLanguage,
            isPhoneVerified: user.isPhoneVerified,
        };
    }

}
