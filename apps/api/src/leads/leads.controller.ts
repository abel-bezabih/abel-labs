import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/lead.dto';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a lead/contact form' })
  @ApiResponse({ status: 201, description: 'Lead submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createLead(@Body() dto: CreateLeadDto) {
    return this.leadsService.createLead(dto);
  }
}















