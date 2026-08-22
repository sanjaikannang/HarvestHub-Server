import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ListInspectorsQuery } from './list-inspectors.request';
import { ListInspectorsResponse } from './list-inspectors.response';
import { AuthService } from 'src/services/auth-service/auth.service';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

@Controller('auth')
export class ListInspectorsController {
    constructor(private readonly authService: AuthService) { }

    @Get('inspectors')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async listInspectors(@Query() query: ListInspectorsQuery, @Req() req: Request): Promise<ListInspectorsResponse> {
        const requestingUser = (req as any).user;
        const data = await this.authService.listInspectorsAPI(requestingUser, query.districtId);

        return {
            success: true,
            message: 'Inspectors fetched successfully',
            data,
        };
    }
}
