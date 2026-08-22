import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsNotEmpty, Min } from 'class-validator';
import { RecommendedVerdict } from 'src/utils/enum';

export class RecordFindingsRequest {

    @IsNumber()
    @Min(0)
    verifiedQuantity: number;

    @IsString()
    @IsNotEmpty()
    qualityGrade: string;

    @IsOptional()
    @IsString()
    conditionNotes?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    inspectionPhotos?: string[];

    @IsEnum(RecommendedVerdict)
    recommendedVerdict: RecommendedVerdict;

}
