import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { DispatchInventoryRequest } from './dispatch-inventory.request';
import { DispatchInventoryResponse } from './dispatch-inventory.response';
import { Controller, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { CollectionCenterInventoryService } from 'src/services/collection-center-inventory-service/collection-center-inventory.service';

@Controller('collection-center-inventory')
export class DispatchInventoryController {
    constructor(private readonly inventoryService: CollectionCenterInventoryService) { }

    @Patch(':id/dispatch')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async dispatchInventory(
        @Param('id') id: string,
        @Body() body: DispatchInventoryRequest,
        @Req() req: Request,
    ): Promise<DispatchInventoryResponse> {
        const requestingUser = (req as any).user;
        const data = await this.inventoryService.dispatchAPI(id, body.deliveryPartnerId, requestingUser);

        return {
            success: true,
            message: 'Inventory dispatched successfully',
            data,
        };
    }
}
