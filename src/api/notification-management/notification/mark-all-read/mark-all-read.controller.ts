import { Request } from 'express';
import { RoleGuard } from 'src/guards/role.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { MarkAllReadResponse } from './mark-all-read.response';
import { NotificationService } from 'src/services/notification-service/notification.service';
import { Controller, Patch, Req, UseGuards } from '@nestjs/common';

@Controller('notifications/read-all')
export class MarkAllReadController {
    constructor(private readonly notificationService: NotificationService) { }

    @Patch()
    @UseGuards(JwtAuthGuard, RoleGuard)
    async markAllRead(@Req() req: Request): Promise<MarkAllReadResponse> {
        const userId = (req as any).user.sub;
        await this.notificationService.markAllReadAPI(userId);

        return {
            success: true,
            message: 'All notifications marked as read',
        };
    }
}
