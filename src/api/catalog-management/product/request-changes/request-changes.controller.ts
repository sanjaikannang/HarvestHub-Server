import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RequestChangesRequest } from './request-changes.request';
import { RequestChangesResponse } from './request-changes.response';
import { ProductService } from 'src/services/product-service/product.service';
import { Controller, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';

@Controller('products')
export class RequestChangesController {
    constructor(private readonly productService: ProductService) { }

    @Patch(':id/request-changes')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async requestChanges(
        @Param('id') id: string,
        @Body() body: RequestChangesRequest,
        @Req() req: Request,
    ): Promise<RequestChangesResponse> {
        const requestingUser = (req as any).user;
        const data = await this.productService.requestChangesAPI(id, body.notes, requestingUser);

        return {
            success: true,
            message: 'Changes requested successfully',
            data,
        };
    }
}
