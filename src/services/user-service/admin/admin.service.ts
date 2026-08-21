import { Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';

@Injectable()
export class AdminService {
    constructor(
        private readonly userRepositoryService: UserRepositoryService,
    ) { }


    // Get My Profile API Endpoint — the authenticated admin's own profile,
    // resolved from the JWT rather than a client-supplied id
    async getMyProfileAPI(userId: string) {
        const user = await this.userRepositoryService.findById(userId);
        if (!user) {
            throw new NotFoundException('Admin profile not found');
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
