import { Controller, Get, Post, Put, Param, Body, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { InvoiceRemindersService } from './invoice-reminders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@abel-labs/types';
import { CreateInvoiceDto, UpdateInvoiceStatusDto, UpdateInvoiceDto } from './dto/invoice.dto';

@ApiTags('invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(
    private invoicesService: InvoicesService,
    private invoiceRemindersService: InvoiceRemindersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  async findAll(@Request() req, @Param('projectId') projectId?: string) {
    return this.invoicesService.findAll(projectId, req.user?.id, req.user?.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  async findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create invoice' })
  async create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(dto.projectId, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateInvoiceStatusDto) {
    return this.invoicesService.updateStatus(id, dto.status);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update invoice (Admin only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, dto);
  }

  @Post(':id/send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Send invoice to client with payment link (Admin only)' })
  async sendInvoice(@Param('id') id: string) {
    return this.invoicesService.sendInvoice(id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download invoice as PDF' })
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.invoicesService.generatePdf(id);
    const invoice = await this.invoicesService.findOne(id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`
    );
    res.send(pdfBuffer);
  }

  /**
   * Manually trigger overdue invoice reminders (Admin only)
   */
  @Post('reminders/send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger overdue invoice reminders (Admin only)' })
  async sendReminders() {
    await this.invoiceRemindersService.sendOverdueReminders();
    return { message: 'Overdue invoice reminders check completed' };
  }
}







