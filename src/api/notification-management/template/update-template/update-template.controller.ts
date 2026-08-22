import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdateTemplateRequest } from './update-template.request';
import { UpdateTemplateResponse } from './update-template.response';
import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationTemplateService } from 'src/services/notification-template-service/notification-template.service';

@Controller('notification-templates/:id')
export class UpdateTemplateController {
    constructor(private readonly notificationTemplateService: NotificationTemplateService) { }

    @Patch()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async updateTemplate(@Param('id') id: string, @Body() body: UpdateTemplateRequest): Promise<UpdateTemplateResponse> {
        const data = await this.notificationTemplateService.updateTemplateAPI(id, { en: body.en, ta: body.ta });

        return {
            success: true,
            message: 'Notification template updated successfully',
            data,
        };
    }
}
