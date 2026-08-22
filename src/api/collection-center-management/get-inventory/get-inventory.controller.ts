import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetInventoryResponse } from './get-inventory.response';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { CollectionCenterInventoryService } from 'src/services/collection-center-inventory-service/collection-center-inventory.service';

@Controller('collection-center-inventory')
export class GetInventoryController {
    constructor(private readonly inventoryService: CollectionCenterInventoryService) { }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async getInventory(@Param('id') id: string, @Req() req: Request): Promise<GetInventoryResponse> {
        const requestingUser = (req as any).user;
        const data = await this.inventoryService.getInventoryByIdAPI(id, requestingUser);

        return {
            success: true,
            message: 'Inventory entry fetched successfully',
            data,
        };
    }
}
