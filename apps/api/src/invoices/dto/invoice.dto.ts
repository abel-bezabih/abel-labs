import { IsEnum, IsNumber, IsDateString, IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatus, Currency } from '@abel-labs/types';

class InvoiceItemDto {
  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty()
  @IsNumber()
  total: number;
}

export class CreateInvoiceDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty()
  @IsDateString()
  dueDate: string;

  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}

export class UpdateInvoiceStatusDto {
  @ApiProperty({ enum: InvoiceStatus })
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}

export class UpdateInvoiceDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ enum: Currency, required: false })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ type: [InvoiceItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items?: InvoiceItemDto[];
}










