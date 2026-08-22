import { Request } from 'express';
import { RoleGuard } from 'src/guards/role.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from 'src/services/notification-service/notification.service';
import { UnreadCountResponse } from './unread-count.response';

@Controller('notifications/unread-count')
export class UnreadCountController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    async unreadCount(@Req() req: Request): Promise<UnreadCountResponse> {
        const userId = (req as any).user.sub;
        const data = await this.notificationService.getUnreadCountAPI(userId);

        return {
            success: true,
            message: 'Unread count fetched successfully',
            data,
        };
    }
}
