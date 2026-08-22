import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class ResolveDisputeRequest {

    @IsIn(['reject', 'refund', 'escalate'])
    outcome: 'reject' | 'refund' | 'escalate';

    @IsString()
    @IsNotEmpty()
    resolutionNotes: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    refundAmount?: number;

}
