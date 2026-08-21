import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ListCollectionCentersQuery } from './list-collection-centers.request';
import { ListCollectionCentersResponse } from './list-collection-centers.response';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { CollectionCenterService } from 'src/services/collection-center-service/collection-center.service';

@Controller('collection-centers')
export class ListCollectionCentersController {
    constructor(private readonly collectionCenterService: CollectionCenterService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async listCollectionCenters(
        @Query() query: ListCollectionCentersQuery,
        @Req() req: Request,
    ): Promise<ListCollectionCentersResponse> {
        const requestingUser = (req as any).user;
        const data = await this.collectionCenterService.listCollectionCentersAPI(query.districtId, requestingUser);

        return {
            success: true,
            message: 'Collection centers fetched successfully',
            data,
        };
    }
}
