import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

// Repositories
import { UserRepositoryService } from "./user-repository/user.repository";
import { AuthActivityLogRepositoryService } from "./auth-activity-log-repository/auth-activity-log.repository";
import { DistrictRepositoryService } from "./district-repository/district.repository";
import { CollectionCenterRepositoryService } from "./collection-center-repository/collection-center.repository";

// Schemas
import { User, UserSchema } from "src/schemas/User/user.schema";
import { AuthActivityLog, AuthActivityLogSchema } from "src/schemas/AuthActivityLog/auth-activity-log.schema";
import { District, DistrictSchema } from "src/schemas/District/district.schema";
import { CollectionCenter, CollectionCenterSchema } from "src/schemas/CollectionCenter/collection-center.schema";

// Single aggregator module for every repository in the app — feature modules
// import this once rather than wiring MongooseModule.forFeature() themselves.
// Add new schemas/repositories here as HarvestHub's other modules (catalog,
// inspections, bidding, etc.) get built out.
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: AuthActivityLog.name, schema: AuthActivityLogSchema },
            { name: District.name, schema: DistrictSchema },
            { name: CollectionCenter.name, schema: CollectionCenterSchema },
        ]),
    ],
    controllers: [],
    providers: [
        UserRepositoryService,
        AuthActivityLogRepositoryService,
        DistrictRepositoryService,
        CollectionCenterRepositoryService,
    ],
    exports: [
        UserRepositoryService,
        AuthActivityLogRepositoryService,
        DistrictRepositoryService,
        CollectionCenterRepositoryService,
    ],
})
export class RepositoryModule { }
