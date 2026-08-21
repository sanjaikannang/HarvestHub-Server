import { IsString, IsNotEmpty } from 'class-validator';

export class RequestChangesRequest {

    @IsString()
    @IsNotEmpty()
    notes: string;

}
