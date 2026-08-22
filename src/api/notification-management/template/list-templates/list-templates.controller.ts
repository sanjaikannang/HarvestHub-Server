import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ListTemplatesResponse } from './list-templates.response';
import { NotificationTemplateService } from 'src/services/notification-template-service/notification-template.service';

@Controller('notification-templates')
export class ListTemplatesController {
    constructor(private readonly notificationTemplateService: NotificationTemplateService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async listTemplates(): Promise<ListTemplatesResponse> {
        const data = await this.notificationTemplateService.listTemplatesAPI();

        return {
            success: true,
            message: 'Notification templates fetched successfully',
            data,
        };
    }
}
