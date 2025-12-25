import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class AddMessageDto {
  @ApiProperty()
  @IsString()
  content: string;
}














