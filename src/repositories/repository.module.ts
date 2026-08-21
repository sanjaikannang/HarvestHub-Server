import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

// Repositories
import { UserRepositoryService } from "./user-repository/user.repository";
import { AuthActivityLogRepositoryService } from "./auth-activity-log-repository/auth-activity-log.repository";
import { DistrictRepositoryService } from "./district-repository/district.repository";
import { CollectionCenterRepositoryService } from "./collection-center-repository/collection-center.repository";
import { CategoryRepositoryService } from "./category-repository/category.repository";
import { ProductRepositoryService } from "./product-repository/product.repository";
import { AuditLogRepositoryService } from "./audit-log-repository/audit-log.repository";

// Schemas
import { User, UserSchema } from "src/schemas/User/user.schema";
import { AuthActivityLog, AuthActivityLogSchema } from "src/schemas/AuthActivityLog/auth-activity-log.schema";
import { District, DistrictSchema } from "src/schemas/District/district.schema";
import { CollectionCenter, CollectionCenterSchema } from "src/schemas/CollectionCenter/collection-center.schema";
import { Category, CategorySchema } from "src/schemas/Category/category.schema";
import { Product, ProductSchema } from "src/schemas/Product/product.schema";
import { AuditLog, AuditLogSchema } from "src/schemas/AuditLog/audit-log.schema";

// Single aggregator module for every repository in the app — feature modules
// import this once rather than wiring MongooseModule.forFeature() themselves.
// Add new schemas/repositories here as HarvestHub's other modules
// (inspections, bidding, etc.) get built out.
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: AuthActivityLog.name, schema: AuthActivityLogSchema },
            { name: District.name, schema: DistrictSchema },
            { name: CollectionCenter.name, schema: CollectionCenterSchema },
            { name: Category.name, schema: CategorySchema },
            { name: Product.name, schema: ProductSchema },
            { name: AuditLog.name, schema: AuditLogSchema },
        ]),
    ],
    controllers: [],
    providers: [
        UserRepositoryService,
        AuthActivityLogRepositoryService,
        DistrictRepositoryService,
        CollectionCenterRepositoryService,
        CategoryRepositoryService,
        ProductRepositoryService,
        AuditLogRepositoryService,
    ],
    exports: [
        UserRepositoryService,
        AuthActivityLogRepositoryService,
        DistrictRepositoryService,
        CollectionCenterRepositoryService,
        CategoryRepositoryService,
        ProductRepositoryService,
        AuditLogRepositoryService,
    ],
})
export class RepositoryModule { }
