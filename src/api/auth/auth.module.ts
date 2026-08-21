import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

// Schemas
import { User, UserSchema } from 'src/schemas/User/user.schema';

// Services
import { ConfigService } from 'src/config/config.service';
import { AuthService } from 'src/services/auth-service/auth.service';
import { AuthJwtService } from 'src/services/auth-service/jwt.service';
import { PasswordService } from 'src/services/auth-service/password.service';

// Controllers
import { LoginController } from './login/login.controller';
import { RegisterController } from './register/register.controller';
import { LogoutController } from './logout/logout.controller';
import { RefreshTokenController } from './refresh-token/refresh-token.controller';
import { ChangePasswordController } from './change-password/change-password.controller';
import { ForgotPasswordController } from './forgot-password/forgot-password.controller';
import { ResetPasswordController } from './reset-password/reset-password.controller';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Modules
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
        ]),
        RepositoryModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getJWTSecretKey(),
                signOptions: {
                    expiresIn: configService.getJWTExpiresIn(),
                },
            }),
        }),
    ],
    controllers: [
        LoginController,
        RegisterController,
        LogoutController,
        RefreshTokenController,
        ChangePasswordController,
        ForgotPasswordController,
        ResetPasswordController,
    ],
    providers: [
        ConfigService,
        AuthService,
        AuthJwtService,
        PasswordService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        ConfigService,
        AuthService,
        AuthJwtService,
        JwtAuthGuard,
        RoleGuard,
    ],
})
export class AuthModule { }
