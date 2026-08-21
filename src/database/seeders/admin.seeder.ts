import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../schemas/User/user.schema';
import { PreferredLanguage, UserRole } from '../../utils/enum';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class AdminSeeder {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly configService: ConfigService,
    ) { }

    async seed(): Promise<void> {
        try {
            const existingAdmin = await this.userModel.findOne({
                role: UserRole.SUPER_ADMIN
            }).exec();

            if (existingAdmin) {
                console.log('Super admin user already exists. Skipping seed.');
                return;
            }

            const adminEmail = this.configService.getInitialAdminEmail();
            const adminPassword = this.configService.getInitialAdminPassword();

            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

            const adminUser = new this.userModel({
                name: 'System Administrator',
                phone: '+910000000000',
                email: adminEmail,
                password: hashedPassword,
                role: UserRole.SUPER_ADMIN,
                isActive: true,
                isPhoneVerified: true,
                isFirstLogin: true, // Force password change on first login
                preferredLanguage: PreferredLanguage.EN,
                lastPasswordChange: new Date(),
            });

            await adminUser.save();

            console.log(`Super admin user created successfully!`);
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
            console.log(`Please change the password on first login!`);

        } catch (error) {
            console.error('Error creating super admin user:', error.message);
            throw error;
        }
    }

    async drop(): Promise<void> {
        try {
            const adminUser = await this.userModel.findOne({
                role: UserRole.SUPER_ADMIN
            }).exec();

            if (adminUser) {
                await this.userModel.deleteOne({ _id: adminUser._id }).exec();
                console.log('Super admin user removed successfully!');
            } else {
                console.log('No super admin user found to remove.');
            }
        } catch (error) {
            console.error('Error removing super admin user:', error.message);
            throw error;
        }
    }
}
