import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetCollectionCenterResponse } from './get-collection-center.response';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { CollectionCenterService } from 'src/services/collection-center-service/collection-center.service';

@Controller('collection-centers')
export class GetCollectionCenterController {
    constructor(private readonly collectionCenterService: CollectionCenterService) { }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async getCollectionCenter(@Param('id') id: string, @Req() req: Request): Promise<GetCollectionCenterResponse> {
        const requestingUser = (req as any).user;
        const data = await this.collectionCenterService.getCollectionCenterByIdAPI(id, requestingUser);

        return {
            success: true,
            message: 'Collection center fetched successfully',
            data,
        };
    }
}
