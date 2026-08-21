import { Request } from 'express';
import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdateCollectionCenterRequest } from './update-collection-center.request';
import { UpdateCollectionCenterResponse } from './update-collection-center.response';
import { Controller, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { CollectionCenterService } from 'src/services/collection-center-service/collection-center.service';

@Controller('collection-centers')
export class UpdateCollectionCenterController {
    constructor(private readonly collectionCenterService: CollectionCenterService) { }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN)
    async updateCollectionCenter(
        @Param('id') id: string,
        @Body() body: UpdateCollectionCenterRequest,
        @Req() req: Request,
    ): Promise<UpdateCollectionCenterResponse> {
        const requestingUser = (req as any).user;
        const data = await this.collectionCenterService.updateCollectionCenterAPI(id, body, requestingUser);

        return {
            success: true,
            message: 'Collection center updated successfully',
            data,
        };
    }
}
