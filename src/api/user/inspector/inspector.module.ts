import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Services
import { ConfigService } from 'src/config/config.service';
import { InspectorService } from 'src/services/user-service/inspector/inspector.service';

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
        InspectorService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        ConfigService,
        InspectorService,
        JwtAuthGuard,
        RoleGuard,
    ],
})
export class InspectorModule { }
