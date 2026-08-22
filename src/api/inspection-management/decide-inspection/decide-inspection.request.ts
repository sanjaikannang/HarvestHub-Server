import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { AdminDecision } from 'src/utils/enum';

// `reason` is required for REJECTED/CHANGES_REQUESTED and `collectionCenterId`
// is required for APPROVED — enforced in the service layer since it's
// conditional on `decision` (see InspectionService.decideAPI).
export class DecideInspectionRequest {

    @IsEnum(AdminDecision)
    decision: AdminDecision;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsMongoId()
    collectionCenterId?: string;

}
