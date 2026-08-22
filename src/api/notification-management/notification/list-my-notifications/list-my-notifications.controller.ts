import { Request } from 'express';
import { RoleGuard } from 'src/guards/role.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { NotificationService } from 'src/services/notification-service/notification.service';
import { ListMyNotificationsQuery } from './list-my-notifications.request';
import { ListMyNotificationsResponse } from './list-my-notifications.response';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

@Controller('notifications/mine')
export class ListMyNotificationsController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    async listMyNotifications(@Query() query: ListMyNotificationsQuery, @Req() req: Request): Promise<ListMyNotificationsResponse> {
        const userId = (req as any).user.sub;
        const data = await this.notificationService.listMyNotificationsAPI(userId, { isRead: query.isRead });

        return {
            success: true,
            message: 'Notifications fetched successfully',
            data,
        };
    }
}
