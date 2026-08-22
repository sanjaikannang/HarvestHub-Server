import { IsNumber, Max, Min } from 'class-validator';

export class UpdateSettingsRequest {

    @IsNumber()
    @Min(0)
    @Max(100)
    commissionPercentage: number;

}
