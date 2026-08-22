import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ReserveInventoryResponse } from './reserve-inventory.response';
import { Controller, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { CollectionCenterInventoryService } from 'src/services/collection-center-inventory-service/collection-center-inventory.service';

@Controller('collection-center-inventory')
export class ReserveInventoryController {
    constructor(private readonly inventoryService: CollectionCenterInventoryService) { }

    @Patch(':id/reserve')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async reserveInventory(@Param('id') id: string, @Req() req: Request): Promise<ReserveInventoryResponse> {
        const requestingUser = (req as any).user;
        const data = await this.inventoryService.reserveAPI(id, requestingUser);

        return {
            success: true,
            message: 'Inventory reserved for sale',
            data,
        };
    }
}
