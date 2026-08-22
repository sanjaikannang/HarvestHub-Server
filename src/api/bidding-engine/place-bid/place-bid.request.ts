import { IsNumber, Min } from 'class-validator';

export class PlaceBidRequest {

    @IsNumber()
    @Min(0.01)
    amount: number;

}
