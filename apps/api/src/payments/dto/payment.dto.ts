import { IsEnum, IsString, IsNumber, IsOptional, IsEmail, Min, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentProvider, Currency } from '@abel-labs/types';

/**
 * DTO for creating a payment checkout session
 */
export class CreateCheckoutDto {
  @ApiProperty({ description: 'Invoice ID to pay' })
  @IsString()
  invoiceId: string;

  @ApiPropertyOptional({ description: 'Return URL after successful payment' })
  @IsString()
  @IsOptional()
  successUrl?: string;

  @ApiPropertyOptional({ description: 'Return URL if payment is cancelled' })
  @IsString()
  @IsOptional()
  cancelUrl?: string;

  @ApiPropertyOptional({ description: 'Override provider (usually auto-selected by currency)' })
  @IsEnum(PaymentProvider)
  @IsOptional()
  provider?: PaymentProvider;
}

/**
 * DTO for creating a subscription checkout session
 */
export class CreateSubscriptionCheckoutDto {
  @ApiProperty({ description: 'Stripe Price ID for the subscription' })
  @IsString()
  priceId: string;

  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  customerEmail: string;

  @ApiPropertyOptional({ description: 'Customer name' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Return URL after successful subscription' })
  @IsString()
  @IsOptional()
  successUrl?: string;

  @ApiPropertyOptional({ description: 'Return URL if subscription is cancelled' })
  @IsString()
  @IsOptional()
  cancelUrl?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, string>;
}

/**
 * DTO for refunding a payment
 */
export class RefundPaymentDto {
  @ApiProperty({ description: 'Transaction ID to refund' })
  @IsString()
  transactionId: string;

  @ApiPropertyOptional({ description: 'Partial refund amount (if not provided, full refund)' })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;
}

/**
 * DTO for checking payment status
 */
export class CheckPaymentStatusDto {
  @ApiProperty({ description: 'Transaction ID to check' })
  @IsString()
  transactionId: string;

  @ApiPropertyOptional({ description: 'Payment provider' })
  @IsEnum(PaymentProvider)
  @IsOptional()
  provider?: PaymentProvider;
}
