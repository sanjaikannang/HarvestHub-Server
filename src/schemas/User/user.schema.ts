import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PreferredLanguage, UserRole } from 'src/utils/enum';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

// Base identity record for every role on the platform (see database/users.md).
// Role-specific extra fields live in a separate profile collection
// (farmer-profiles / buyer-profiles / delivery-partner-profiles) referenced by
// userId, once those feature modules are built — SUPER_ADMIN/DISTRICT_ADMIN/
// INSPECTOR have no separate profile collection by design.
@Schema({ timestamps: true })
export class User {

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    phone: string;

    @Prop({ unique: true, sparse: true })
    email?: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, enum: Object.values(UserRole) })
    role: UserRole;

    @Prop({ default: false })
    isPhoneVerified: boolean;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: true })
    isFirstLogin: boolean;  // Force password change on first login (admin-onboarded roles)

    // Required for DISTRICT_ADMIN/INSPECTOR/FARMER; optional home district for BUYER;
    // null for SUPER_ADMIN. Not enforced at the schema level since it's role-conditional
    // — validate in the service layer once District Management (module 02) exists.
    @Prop({ type: Types.ObjectId, ref: 'District' })
    districtId?: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(PreferredLanguage), default: PreferredLanguage.EN })
    preferredLanguage: PreferredLanguage;

    @Prop()
    lastLogin: Date;

    @Prop()
    lastPasswordChange: Date;

    @Prop()
    accessToken: string;

    @Prop()
    refreshToken: string;

    @Prop()
    resetPasswordTokenHash: string;

    @Prop()
    resetPasswordTokenExpiresAt: Date;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

}

export const UserSchema = SchemaFactory.createForClass(User);

// Define indexes — phone/email uniqueness is already indexed via their @Prop({ unique: true })
UserSchema.index({ role: 1, districtId: 1 });
UserSchema.index({ lastLogin: 1 });
