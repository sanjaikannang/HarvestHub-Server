import { Module } from '@nestjs/common';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Controllers — Notification
import { ListMyNotificationsController } from './notification/list-my-notifications/list-my-notifications.controller';
import { UnreadCountController } from './notification/unread-count/unread-count.controller';
import { MarkReadController } from './notification/mark-read/mark-read.controller';
import { MarkAllReadController } from './notification/mark-all-read/mark-all-read.controller';

// Controllers — Template
import { ListTemplatesController } from './template/list-templates/list-templates.controller';
import { UpdateTemplateController } from './template/update-template/update-template.controller';

// Modules
import { ServiceModule } from 'src/services/service.module';
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
    imports: [
        ServiceModule,
        RepositoryModule,
    ],
    controllers: [
        // Literal sub-paths before any /notifications/:id route
        ListMyNotificationsController,
        UnreadCountController,
        MarkAllReadController,
        MarkReadController,

        ListTemplatesController,
        UpdateTemplateController,
    ],
    providers: [
        JwtAuthGuard,
        RoleGuard,
    ],
})
export class NotificationManagementModule { }
