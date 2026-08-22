import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AuthService } from 'src/services/auth-service/auth.service';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ListDeliveryPartnersResponse } from './list-delivery-partners.response';

// Not district-scoped — see AuthService.listDeliveryPartnersAPI
@Controller('auth')
export class ListDeliveryPartnersController {
    constructor(private readonly authService: AuthService) { }

    @Get('delivery-partners')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async listDeliveryPartners(): Promise<ListDeliveryPartnersResponse> {
        const data = await this.authService.listDeliveryPartnersAPI();

        return {
            success: true,
            message: 'Delivery partners fetched successfully',
            data,
        };
    }
}
