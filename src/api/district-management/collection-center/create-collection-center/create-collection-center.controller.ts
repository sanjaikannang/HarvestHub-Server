import { UserRole } from 'src/utils/enum';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CreateCollectionCenterRequest } from './create-collection-center.request';
import { CreateCollectionCenterResponse } from './create-collection-center.response';
import { CollectionCenterService } from 'src/services/collection-center-service/collection-center.service';

@Controller('collection-centers')
export class CreateCollectionCenterController {
    constructor(private readonly collectionCenterService: CollectionCenterService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async createCollectionCenter(@Body() body: CreateCollectionCenterRequest): Promise<CreateCollectionCenterResponse> {
        const data = await this.collectionCenterService.createCollectionCenterAPI(body);

        return {
            success: true,
            message: 'Collection center created successfully',
            data,
        };
    }
}
