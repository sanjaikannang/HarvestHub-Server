import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Services
import { ConfigService } from 'src/config/config.service';
import { FarmerService } from 'src/services/user-service/farmer/farmer.service';

// Controllers
import { GetMyProfileController } from './profile/get-my-profile/get-my-profile.controller';

// Modules
import { ServiceModule } from 'src/services/service.module';
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getJWTSecretKey(),
                signOptions: {
                    expiresIn: configService.getJWTExpiresIn(),
                },
            }),
        }),
        ServiceModule,
        RepositoryModule,
    ],
    controllers: [
        GetMyProfileController,
    ],
    providers: [
        ConfigService,
        FarmerService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        ConfigService,
        FarmerService,
        JwtAuthGuard,
        RoleGuard,
    ],
})
export class FarmerModule { }
