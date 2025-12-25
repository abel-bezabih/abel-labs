import { IsNumber, IsEnum, IsDateString, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '@abel-labs/types';

export class ApproveBriefDto {
  @ApiProperty()
  @IsNumber()
  approvedBudget: number;

  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  approvedCurrency: Currency;

  @ApiProperty()
  @IsDateString()
  approvedDeadline: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

export class RejectBriefDto {
  @ApiProperty()
  @IsString()
  adminNotes: string;
}














