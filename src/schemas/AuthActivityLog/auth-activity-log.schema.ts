import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRole } from 'src/utils/enum';
import { Document, Types } from 'mongoose';

export enum AuthAction {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
}

export type AuthActivityLogDocument = AuthActivityLog & Document;

@Schema({ timestamps: true })
export class AuthActivityLog {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true, enum: Object.values(UserRole) })
    role: UserRole;

    @Prop({ required: true, enum: Object.values(AuthAction) })
    action: AuthAction;

    @Prop()
    ipAddress: string;

    @Prop()
    userAgent: string;

}

export const AuthActivityLogSchema = SchemaFactory.createForClass(AuthActivityLog);

// Define indexes
AuthActivityLogSchema.index({ userId: 1, createdAt: -1 });
AuthActivityLogSchema.index({ action: 1, createdAt: -1 });
