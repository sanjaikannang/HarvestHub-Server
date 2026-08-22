import { Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';

@Injectable()
export class InspectorService {
    constructor(
        private readonly userRepositoryService: UserRepositoryService,
    ) { }


    // Get My Profile API Endpoint — the authenticated inspector's own profile.
    // No dedicated InspectorProfile schema exists — just the base User fields.
    async getMyProfileAPI(userId: string) {
        const user = await this.userRepositoryService.findById(userId);
        if (!user) {
            throw new NotFoundException('Inspector profile not found');
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
