import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Services
import { ConfigService } from 'src/config/config.service';
import { BiddingService } from 'src/services/bidding-service/bidding.service';
import { BiddingGateway } from 'src/gateways/bidding.gateway';

// Controllers
import { GetBiddingSessionController } from './get-bidding-session/get-bidding-session.controller';
import { ListBidHistoryController } from './list-bid-history/list-bid-history.controller';
import { PlaceBidController } from './place-bid/place-bid.controller';
import { ListMyBidsController } from './list-my-bids/list-my-bids.controller';

// Modules
import { ServiceModule } from 'src/services/service.module';
import { RepositoryModule } from 'src/repositories/repository.module';
import { PaymentEscrowModule } from 'src/api/payment-escrow/payment-escrow.module';

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
        PaymentEscrowModule,
    ],
    controllers: [
        GetBiddingSessionController,
        ListBidHistoryController,
        PlaceBidController,
        ListMyBidsController,
    ],
    providers: [
        ConfigService,
        BiddingService,
        BiddingGateway,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        BiddingService,
    ],
})
export class BiddingEngineModule { }
