import { ClientSession, Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserRole } from 'src/utils/enum';
import { User, UserDocument } from 'src/schemas/User/user.schema';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';


@Injectable()
export class UserRepositoryService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }


    // Find an active user by email OR phone — HarvestHub logs in with either,
    // since phone is the primary identifier but email is optional (see users.md)
    async findUserByIdentifier(identifier: string): Promise<UserDocument | null> {
        try {
            const user = await this.userModel.findOne({
                isActive: true,
                $or: [{ email: identifier }, { phone: identifier }],
            }).exec();
            return user;
        } catch (error) {
            throw new InternalServerErrorException('Failed to find user by identifier', error);
        }
    }


    // Find an active user by phone
    async findUserByPhone(phone: string): Promise<UserDocument | null> {
        try {
            return await this.userModel.findOne({ phone, isActive: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find user by phone', error);
        }
    }


    // Find an active user by email
    async findUserByEmail(email: string): Promise<UserDocument | null> {
        try {
            return await this.userModel.findOne({ email, isActive: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find user by email', error);
        }
    }


    // Update user
    async updateUser(id: string, updates: Partial<User>, session?: ClientSession): Promise<UserDocument | null> {
        try {
            const updatedUser = await this.userModel.findByIdAndUpdate(id, updates, { new: true, session }).exec();
            return updatedUser;
        } catch (error) {
            throw new InternalServerErrorException('Failed to update user', error);
        }
    }


    // Update user tokens
    async updateUserTokens(userId: string, accessToken: string, refreshToken: string): Promise<void> {
        try {
            const updatedUser = await this.userModel.findByIdAndUpdate(
                userId,
                {
                    accessToken,
                    refreshToken,
                },
                { new: true }
            ).exec();

            if (!updatedUser) {
                throw new NotFoundException(`User with id ${userId} not found`);
            }
        } catch (error) {
            throw new InternalServerErrorException('Failed to update user tokens', error);
        }
    }


    // Find user by refresh token
    async findUserByRefreshToken(refreshToken: string): Promise<UserDocument | null> {
        try {
            const user = await this.userModel.findOne({
                refreshToken,
                isActive: true
            }).exec();
            return user;
        } catch (error) {
            throw new InternalServerErrorException('Failed to find user by refresh token', error);
        }
    }


    // Clear user tokens (for logout)
    async clearUserTokens(userId: string): Promise<void> {
        try {
            const updatedUser = await this.userModel.findByIdAndUpdate(
                userId,
                {
                    accessToken: null,
                    refreshToken: null,
                },
                { new: true }
            ).exec();

            if (!updatedUser) {
                throw new NotFoundException(`User with id ${userId} not found`);
            }
        } catch (error) {
            throw new InternalServerErrorException('Failed to clear user tokens', error);
        }
    }


    // Update user password
    async updateUserPassword(id: string, password: string): Promise<UserDocument | null> {
        try {
            const updatedPassword = await this.userModel.findByIdAndUpdate(
                id,
                {
                    password,
                    isFirstLogin: false,
                    lastPasswordChange: new Date(),
                },
                { new: true }
            ).exec();

            return updatedPassword;
        } catch (error) {
            throw new InternalServerErrorException('Failed to update user password', error);
        }
    }


    // Update Last Login
    async updateLastLogin(id: string): Promise<void> {
        try {
            const updatedUser = await this.userModel.findByIdAndUpdate(
                id,
                { lastLogin: new Date() }
            ).exec();

            if (!updatedUser) {
                throw new NotFoundException(`User with id ${id} not found`);
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update last login', error);
        }
    }


    // Find user by id
    async findById(id: string): Promise<UserDocument | null> {
        try {
            const user = await this.userModel.findById(id).exec();
            return user;
        } catch (error) {
            throw new InternalServerErrorException('Failed to find user by id', error);
        }
    }


    // Set password reset token
    async setPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
        try {
            const updatedUser = await this.userModel.findByIdAndUpdate(
                userId,
                {
                    resetPasswordTokenHash: tokenHash,
                    resetPasswordTokenExpiresAt: expiresAt,
                },
                { new: true }
            ).exec();

            if (!updatedUser) {
                throw new NotFoundException(`User with id ${userId} not found`);
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to set password reset token', error);
        }
    }


    // Reset password (via forgot-password flow)
    async resetPassword(userId: string, hashedPassword: string): Promise<void> {
        try {
            const updatedUser = await this.userModel.findByIdAndUpdate(
                userId,
                {
                    password: hashedPassword,
                    resetPasswordTokenHash: null,
                    resetPasswordTokenExpiresAt: null,
                    accessToken: null,
                    refreshToken: null,
                    lastPasswordChange: new Date(),
                },
                { new: true }
            ).exec();

            if (!updatedUser) {
                throw new NotFoundException(`User with id ${userId} not found`);
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to reset password', error);
        }
    }


    // Start Session
    async startSession() {
        return await this.userModel.db.startSession();
    }


    // Create User
    async create(data: Partial<User>, session?: ClientSession): Promise<UserDocument> {
        try {
            const user = new this.userModel(data);
            return await user.save({ session });
        } catch (error) {
            throw new InternalServerErrorException('Failed to create user', error);
        }
    }


    // Clear a user's district assignment — used when reassigning a District
    // Admin away from the district they currently administer (see
    // DistrictService.assignDistrictAdminAPI)
    async clearUserDistrict(userId: string): Promise<void> {
        try {
            await this.userModel.findByIdAndUpdate(userId, { $unset: { districtId: 1 } }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to clear user district', error);
        }
    }


    // Find active users of a given role, optionally scoped to a district —
    // backs District Admin's Inspector directory (see AuthService.listInspectorsAPI)
    async findByRoleAndDistrict(role: UserRole, districtId?: string): Promise<UserDocument[]> {
        try {
            const filter: Record<string, unknown> = { role, isActive: true };
            if (districtId) {
                filter.districtId = new Types.ObjectId(districtId);
            }
            return await this.userModel.find(filter).sort({ name: 1 }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to find users by role and district', error);
        }
    }


    // Count active users of a given role within a district — backs the
    // district directory's summary stats (active farmers/buyers)
    async countActiveByDistrictAndRole(districtId: string, role: UserRole): Promise<number> {
        try {
            return await this.userModel.countDocuments({
                districtId: new Types.ObjectId(districtId),
                role,
                isActive: true,
            }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to count users by district and role', error);
        }
    }


    // Platform-wide active user count by role — backs the Super Admin
    // dashboard's totals (see Admin Dashboard & Reporting, module 11)
    async countByRole(role: UserRole): Promise<number> {
        try {
            return await this.userModel.countDocuments({ role, isActive: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException('Failed to count users by role', error);
        }
    }

}
