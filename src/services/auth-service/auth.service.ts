import * as crypto from 'crypto';
import { Types } from "mongoose";
import { UserRole } from "src/utils/enum";
import { AuthJwtService } from './jwt.service';
import { PasswordService } from './password.service';
import { ConfigService } from 'src/config/config.service';
import { LoginRequest } from 'src/api/auth/login/login.request';
import { RegisterRequest } from 'src/api/auth/register/register.request';
import { AuthAction } from 'src/schemas/AuthActivityLog/auth-activity-log.schema';
import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { UserRepositoryService } from 'src/repositories/user-repository/user.repository';
import { DeliveryPartnerProfileRepositoryService } from 'src/repositories/delivery-partner-profile-repository/delivery-partner-profile.repository';
import { ResetPasswordRequest } from 'src/api/auth/reset-password/reset-password.request';
import { ChangePasswordRequest } from 'src/api/auth/change-password/change-password.request';
import { AuthActivityLogRepositoryService } from 'src/repositories/auth-activity-log-repository/auth-activity-log.repository';

export interface RequestMetadata {
    ipAddress?: string;
    userAgent?: string;
}
function hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// Roles that are allowed to self-register (see modules/01-auth-user-management —
// SUPER_ADMIN is seeded manually, DISTRICT_ADMIN/INSPECTOR/DELIVERY_PARTNER are
// onboarded by an admin, never self-registered).
const SELF_REGISTERABLE_ROLES = [UserRole.FARMER, UserRole.BUYER];

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepositoryService: UserRepositoryService,
        private readonly deliveryPartnerProfileRepositoryService: DeliveryPartnerProfileRepositoryService,
        private readonly authActivityLogRepositoryService: AuthActivityLogRepositoryService,
        private readonly passwordService: PasswordService,
        private readonly jwtService: AuthJwtService,
        private readonly configService: ConfigService,
    ) { }


    // Register API Endpoint — self-registration for Farmer/Buyer only
    async registerAPI(registerData: RegisterRequest) {
        const { name, phone, email, password, role, districtId } = registerData;

        if (!SELF_REGISTERABLE_ROLES.includes(role)) {
            throw new BadRequestException('This role cannot self-register — contact an administrator');
        }

        const existingByPhone = await this.userRepositoryService.findUserByPhone(phone);
        if (existingByPhone) {
            throw new ConflictException('An account with this phone number already exists');
        }

        if (email) {
            const existingByEmail = await this.userRepositoryService.findUserByEmail(email);
            if (existingByEmail) {
                throw new ConflictException('An account with this email already exists');
            }
        }

        const passwordValidation = this.passwordService.validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            throw new BadRequestException(passwordValidation.message);
        }

        const hashedPassword = await this.passwordService.hashPassword(password);

        const user = await this.userRepositoryService.create({
            name,
            phone,
            email,
            password: hashedPassword,
            role,
            isActive: true,
            isPhoneVerified: false, // TODO: wire up OTP verification once the Notification module exists
            isFirstLogin: false,    // self-registered — the user already chose their own password
            ...(districtId ? { districtId: new Types.ObjectId(districtId) } : {}),
        });

        return {
            id: (user._id as Types.ObjectId).toString(),
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
        };
    }


    // Login API Endpoint — by phone OR email
    async loginAPI(loginData: LoginRequest, meta: RequestMetadata = {}) {
        const { identifier, password } = loginData;

        const user = await this.userRepositoryService.findUserByIdentifier(identifier);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await this.passwordService.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const userId = (user._id as Types.ObjectId).toString();

        const accessToken = this.jwtService.generateAccessToken({
            sub: userId,
            email: user.email,
            phone: user.phone,
            role: user.role,
        });

        const refreshToken = this.jwtService.generateRefreshToken({
            sub: userId,
            email: user.email,
            phone: user.phone,
            role: user.role,
        });

        await this.userRepositoryService.updateUserTokens(userId, accessToken, refreshToken);
        await this.userRepositoryService.updateLastLogin(userId);

        await this.authActivityLogRepositoryService.create({
            userId: user._id as Types.ObjectId,
            email: user.email || user.phone,
            role: user.role,
            action: AuthAction.LOGIN,
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
        });

        return {
            user: {
                id: userId,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role,
                isFirstLogin: user.isFirstLogin,
            },
            tokens: {
                accessToken,
                refreshToken
            },
        };
    }


    // Refresh Token API Endpoint
    async refreshTokenAPI(refreshToken: string) {
        try {
            const payload = this.jwtService.verifyRefreshToken(refreshToken);

            const user = await this.userRepositoryService.findUserByRefreshToken(refreshToken);
            if (!user) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const newAccessToken = this.jwtService.generateAccessToken({
                sub: payload.sub,
                email: payload.email,
                phone: payload.phone,
                role: payload.role,
            });

            const newRefreshToken = this.jwtService.generateRefreshToken({
                sub: payload.sub,
                email: payload.email,
                phone: payload.phone,
                role: payload.role,
            });

            await this.userRepositoryService.updateUserTokens(
                payload.sub,
                newAccessToken,
                newRefreshToken
            );

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }


    // Change Password API Endpoint (forced change on first login)
    async changePasswordAPI(changePasswordData: ChangePasswordRequest) {
        const { identifier, currentPassword, newPassword, confirmPassword } = changePasswordData;

        if (newPassword !== confirmPassword) {
            throw new BadRequestException('New password and confirm password do not match');
        }

        const user = await this.userRepositoryService.findUserByIdentifier(identifier);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (!user.isFirstLogin) {
            throw new BadRequestException('You have already changed your password. Please use the login to access your account.');
        }

        const isCurrentPasswordValid = await this.passwordService.comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        const passwordValidation = this.passwordService.validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            throw new BadRequestException(passwordValidation.message);
        }

        const hashedPassword = await this.passwordService.hashPassword(newPassword);

        await this.userRepositoryService.updateUserPassword((user._id as Types.ObjectId).toString(), hashedPassword);

        return {
            message: 'Password changed successfully'
        };
    }


    // Logout API Endpoint
    async logoutAPI(userId: string, meta: RequestMetadata & { email: string; role: UserRole }) {
        try {
            await this.userRepositoryService.clearUserTokens(userId);

            await this.authActivityLogRepositoryService.create({
                userId: new Types.ObjectId(userId),
                email: meta.email,
                role: meta.role,
                action: AuthAction.LOGOUT,
                ipAddress: meta.ipAddress,
                userAgent: meta.userAgent,
            });

            return {
                message: 'Logged out successfully'
            };

        } catch (error) {
            throw new UnauthorizedException('Failed to logout');
        }
    }


    // Forgot Password API Endpoint — by phone or email
    async forgotPasswordAPI(identifier: string) {
        const user = await this.userRepositoryService.findUserByIdentifier(identifier);

        if (user && user.role === UserRole.SUPER_ADMIN) {
            throw new BadRequestException('Forgot password is not available for super admin accounts');
        }

        if (user) {
            const userId = (user._id as Types.ObjectId).toString();

            const resetToken = this.jwtService.generatePasswordResetToken({
                sub: userId,
                identifier,
            });

            const tokenHash = hashResetToken(resetToken);
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            await this.userRepositoryService.setPasswordResetToken(userId, tokenHash, expiresAt);

            if (user.email) {
                const resetLink = `${this.configService.getFrontEndBaseUrl2()}/reset-password/${resetToken}`;
                // TODO: integrate an email service to send resetLink to user.email
                console.log(`Password reset link for ${user.email}: ${resetLink}`);
            } else {
                // TODO: integrate SMS OTP once the Notification module exists — for
                // now, phone-only accounts have no delivery channel for the reset token.
                console.log(`Password reset token for ${user.phone}: ${resetToken}`);
            }
        }

        return {
            message: 'If this account exists, password reset instructions have been generated.',
        };
    }


    // Reset Password API Endpoint
    async resetPasswordAPI(resetData: ResetPasswordRequest) {
        const { token, newPassword, confirmPassword } = resetData;

        if (newPassword !== confirmPassword) {
            throw new BadRequestException('New password and confirm password do not match');
        }

        let payload;
        try {
            payload = this.jwtService.verifyPasswordResetToken(token);
        } catch (error) {
            throw new BadRequestException('Reset link is invalid or has expired');
        }

        const user = await this.userRepositoryService.findById(payload.sub);
        if (!user || !user.resetPasswordTokenHash || !user.resetPasswordTokenExpiresAt) {
            throw new BadRequestException('Reset link is invalid or has expired');
        }

        if (user.resetPasswordTokenExpiresAt.getTime() < Date.now()) {
            throw new BadRequestException('Reset link is invalid or has expired');
        }

        if (hashResetToken(token) !== user.resetPasswordTokenHash) {
            throw new BadRequestException('Reset link is invalid or has expired');
        }

        const passwordValidation = this.passwordService.validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            throw new BadRequestException(passwordValidation.message);
        }

        const hashedPassword = await this.passwordService.hashPassword(newPassword);

        await this.userRepositoryService.resetPassword((user._id as Types.ObjectId).toString(), hashedPassword);

        return {
            message: 'Password has been reset successfully. Please log in with your new password.',
        };
    }


    // Create Inspector API Endpoint (District Admin) — onboarded, not
    // self-registered; always assigned to the creating admin's own district
    // (see modules/01-auth-user-management.md and modules/04-inspection-management.md)
    async createInspectorAPI(districtAdminUserId: string, data: { name: string; phone: string; email?: string; password: string }) {
        const districtAdmin = await this.userRepositoryService.findById(districtAdminUserId);
        if (!districtAdmin?.districtId) {
            throw new BadRequestException('You must be assigned to a district before you can add an Inspector');
        }

        const existingByPhone = await this.userRepositoryService.findUserByPhone(data.phone);
        if (existingByPhone) {
            throw new ConflictException('An account with this phone number already exists');
        }

        if (data.email) {
            const existingByEmail = await this.userRepositoryService.findUserByEmail(data.email);
            if (existingByEmail) {
                throw new ConflictException('An account with this email already exists');
            }
        }

        const passwordValidation = this.passwordService.validatePasswordStrength(data.password);
        if (!passwordValidation.isValid) {
            throw new BadRequestException(passwordValidation.message);
        }

        const hashedPassword = await this.passwordService.hashPassword(data.password);

        const inspector = await this.userRepositoryService.create({
            name: data.name,
            phone: data.phone,
            email: data.email,
            password: hashedPassword,
            role: UserRole.INSPECTOR,
            districtId: districtAdmin.districtId,
            isActive: true,
            isPhoneVerified: false,
            isFirstLogin: true,
            createdBy: districtAdmin._id as Types.ObjectId,
        });

        return {
            id: (inspector._id as Types.ObjectId).toString(),
            name: inspector.name,
            phone: inspector.phone,
            email: inspector.email,
            role: inspector.role,
            districtId: inspector.districtId?.toString(),
        };
    }


    // List Inspectors API Endpoint — District Admin: own district only,
    // Super Admin: all or filtered by districtId
    async listInspectorsAPI(requestingUser: { sub: string; role: UserRole }, districtId?: string) {
        let scopedDistrictId = districtId;

        if (requestingUser.role === UserRole.DISTRICT_ADMIN) {
            const admin = await this.userRepositoryService.findById(requestingUser.sub);
            if (!admin?.districtId) {
                throw new BadRequestException('You must be assigned to a district first');
            }
            scopedDistrictId = admin.districtId.toString();
        }

        const inspectors = await this.userRepositoryService.findByRoleAndDistrict(UserRole.INSPECTOR, scopedDistrictId);

        return inspectors.map((inspector) => ({
            id: (inspector._id as Types.ObjectId).toString(),
            name: inspector.name,
            phone: inspector.phone,
            email: inspector.email,
            districtId: inspector.districtId?.toString(),
        }));
    }


    // Create Delivery Partner API Endpoint (Super Admin or District Admin) —
    // onboarded, not self-registered (see modules/01-auth-user-management.md).
    // Also creates the DeliveryPartnerProfile (database/delivery-partner-profiles.md)
    // that Order & Delivery Management's auto-assignment logic matches against.
    async createDeliveryPartnerAPI(creatorUserId: string, data: {
        name: string; phone: string; email?: string; password: string;
        districtsServiced: string[]; vehicleType: string; vehicleNumber: string; capacityKg: number;
    }) {
        const creator = await this.userRepositoryService.findById(creatorUserId);
        if (!creator) {
            throw new NotFoundException('Account not found');
        }

        const existingByPhone = await this.userRepositoryService.findUserByPhone(data.phone);
        if (existingByPhone) {
            throw new ConflictException('An account with this phone number already exists');
        }

        if (data.email) {
            const existingByEmail = await this.userRepositoryService.findUserByEmail(data.email);
            if (existingByEmail) {
                throw new ConflictException('An account with this email already exists');
            }
        }

        const passwordValidation = this.passwordService.validatePasswordStrength(data.password);
        if (!passwordValidation.isValid) {
            throw new BadRequestException(passwordValidation.message);
        }

        const hashedPassword = await this.passwordService.hashPassword(data.password);

        const deliveryPartner = await this.userRepositoryService.create({
            name: data.name,
            phone: data.phone,
            email: data.email,
            password: hashedPassword,
            role: UserRole.DELIVERY_PARTNER,
            isActive: true,
            isPhoneVerified: false,
            isFirstLogin: true,
            createdBy: creator._id as Types.ObjectId,
        });

        await this.deliveryPartnerProfileRepositoryService.create({
            userId: deliveryPartner._id as Types.ObjectId,
            districtsServiced: data.districtsServiced.map((id) => new Types.ObjectId(id)),
            vehicleType: data.vehicleType,
            vehicleNumber: data.vehicleNumber,
            capacityKg: data.capacityKg,
        });

        return {
            id: (deliveryPartner._id as Types.ObjectId).toString(),
            name: deliveryPartner.name,
            phone: deliveryPartner.phone,
            email: deliveryPartner.email,
            role: deliveryPartner.role,
        };
    }


    // List Delivery Partners API Endpoint (Super Admin or District Admin) —
    // not district-scoped, per createDeliveryPartnerAPI above
    async listDeliveryPartnersAPI() {
        const deliveryPartners = await this.userRepositoryService.findByRoleAndDistrict(UserRole.DELIVERY_PARTNER);

        return deliveryPartners.map((deliveryPartner) => ({
            id: (deliveryPartner._id as Types.ObjectId).toString(),
            name: deliveryPartner.name,
            phone: deliveryPartner.phone,
            email: deliveryPartner.email,
        }));
    }

}
