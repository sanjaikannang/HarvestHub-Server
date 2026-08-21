import { IsString, IsNotEmpty } from 'class-validator';

export class RejectProductRequest {

    @IsString()
    @IsNotEmpty()
    reason: string;

}
