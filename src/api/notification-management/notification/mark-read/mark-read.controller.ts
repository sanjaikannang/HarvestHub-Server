import { Request } from 'express';
import { RoleGuard } from 'src/guards/role.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { MarkReadResponse } from './mark-read.response';
import { NotificationService } from 'src/services/notification-service/notification.service';
import { Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';

@Controller('notifications/:id/read')
export class MarkReadController {
    constructor(private readonly notificationService: NotificationService) { }

    @Patch()
    @UseGuards(JwtAuthGuard, RoleGuard)
    async markRead(@Param('id') id: string, @Req() req: Request): Promise<MarkReadResponse> {
        const userId = (req as any).user.sub;
        const data = await this.notificationService.markReadAPI(id, userId);

        return {
            success: true,
            message: 'Notification marked as read',
            data,
        };
    }
}
