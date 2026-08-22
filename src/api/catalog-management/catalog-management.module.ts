import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Guards
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

// Services
import { ConfigService } from 'src/config/config.service';
import { CategoryService } from 'src/services/category-service/category.service';
import { ProductService } from 'src/services/product-service/product.service';
import { DistrictService } from 'src/services/district-service/district.service';

// Category controllers
import { CreateCategoryController } from './category/create-category/create-category.controller';
import { UpdateCategoryController } from './category/update-category/update-category.controller';
import { DeactivateCategoryController } from './category/deactivate-category/deactivate-category.controller';
import { ListCategoriesController } from './category/list-categories/list-categories.controller';
import { GetCategoryController } from './category/get-category/get-category.controller';

// Product controllers — ListMyProducts (/products/mine) and ListMarketplace
// (/products/marketplace) MUST be registered before GetProduct (/products/:id),
// or Express will match "mine"/"marketplace" as an :id.
import { CreateProductController } from './product/create-product/create-product.controller';
import { ListMyProductsController } from './product/list-my-products/list-my-products.controller';
import { ListMarketplaceController } from './product/list-marketplace/list-marketplace.controller';
import { GetProductController } from './product/get-product/get-product.controller';
import { ListProductsForReviewController } from './product/list-products-for-review/list-products-for-review.controller';
import { UpdateProductController } from './product/update-product/update-product.controller';
import { StartReviewController } from './product/start-review/start-review.controller';
import { RequestChangesController } from './product/request-changes/request-changes.controller';
import { RejectProductController } from './product/reject-product/reject-product.controller';

// Modules
import { ServiceModule } from 'src/services/service.module';
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getJWTSecretKey(),
                signOptions: {
                    expiresIn: configService.getJWTExpiresIn(),
                },
            }),
        }),
        ServiceModule,
        RepositoryModule,
    ],
    controllers: [
        CreateCategoryController,
        UpdateCategoryController,
        DeactivateCategoryController,
        ListCategoriesController,
        GetCategoryController,
        CreateProductController,
        ListMyProductsController,
        ListMarketplaceController,
        GetProductController,
        ListProductsForReviewController,
        UpdateProductController,
        StartReviewController,
        RequestChangesController,
        RejectProductController,
    ],
    providers: [
        ConfigService,
        CategoryService,
        ProductService,
        DistrictService,
        JwtAuthGuard,
        RoleGuard,
    ],
    exports: [
        CategoryService,
        ProductService,
    ],
})
export class CatalogManagementModule { }
