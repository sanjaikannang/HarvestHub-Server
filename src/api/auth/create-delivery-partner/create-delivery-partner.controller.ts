import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AuthService } from 'src/services/auth-service/auth.service';
import { CreateDeliveryPartnerRequest } from './create-delivery-partner.request';
import { CreateDeliveryPartnerResponse } from './create-delivery-partner.response';
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';

@Controller('auth')
export class CreateDeliveryPartnerController {
    constructor(private readonly authService: AuthService) { }

    @Post('create-delivery-partner')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async createDeliveryPartner(@Body() body: CreateDeliveryPartnerRequest, @Req() req: Request): Promise<CreateDeliveryPartnerResponse> {
        const creatorUserId = (req as any).user.sub;
        const data = await this.authService.createDeliveryPartnerAPI(creatorUserId, body);

        return {
            success: true,
            message: 'Delivery partner account created successfully',
            data,
        };
    }
}
