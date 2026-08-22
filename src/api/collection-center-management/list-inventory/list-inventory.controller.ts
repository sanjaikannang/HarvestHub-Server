import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ListInventoryQuery } from './list-inventory.request';
import { ListInventoryResponse } from './list-inventory.response';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { CollectionCenterInventoryService } from 'src/services/collection-center-inventory-service/collection-center-inventory.service';

@Controller('collection-center-inventory')
export class ListInventoryController {
    constructor(private readonly inventoryService: CollectionCenterInventoryService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async listInventory(@Query() query: ListInventoryQuery, @Req() req: Request): Promise<ListInventoryResponse> {
        const requestingUser = (req as any).user;
        const data = await this.inventoryService.listInventoryAPI(requestingUser, query);

        return {
            success: true,
            message: 'Inventory fetched successfully',
            data,
        };
    }
}
