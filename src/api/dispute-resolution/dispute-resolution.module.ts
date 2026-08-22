import { Module } from '@nestjs/common';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Services
import { DisputeService } from 'src/services/dispute-service/dispute.service';

// Controllers
import { RaiseDisputeController } from './raise-dispute/raise-dispute.controller';
import { ListMyDisputesController } from './list-my-disputes/list-my-disputes.controller';
import { ListDisputesController } from './list-disputes/list-disputes.controller';
import { StartReviewController } from './start-review/start-review.controller';
import { ResolveDisputeController } from './resolve-dispute/resolve-dispute.controller';
import { GetDisputeController } from './get-dispute/get-dispute.controller';

// Modules
import { ServiceModule } from 'src/services/service.module';
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
    imports: [
        ServiceModule,
        RepositoryModule,
    ],
    controllers: [
        // Literal sub-paths before /disputes/:id
        ListMyDisputesController,
        RaiseDisputeController,
        ListDisputesController,
        StartReviewController,
        ResolveDisputeController,
        GetDisputeController,
    ],
    providers: [
        DisputeService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        DisputeService,
    ],
})
export class DisputeResolutionModule { }
