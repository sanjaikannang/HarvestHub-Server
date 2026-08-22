import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateInspectorRequest } from './create-inspector.request';
import { CreateInspectorResponse } from './create-inspector.response';
import { AuthService } from 'src/services/auth-service/auth.service';
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';

@Controller('auth')
export class CreateInspectorController {
    constructor(private readonly authService: AuthService) { }

    @Post('create-inspector')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.DISTRICT_ADMIN)
    async createInspector(@Body() body: CreateInspectorRequest, @Req() req: Request): Promise<CreateInspectorResponse> {
        const districtAdminUserId = (req as any).user.sub;
        const data = await this.authService.createInspectorAPI(districtAdminUserId, body);

        return {
            success: true,
            message: 'Inspector account created successfully',
            data,
        };
    }
}
