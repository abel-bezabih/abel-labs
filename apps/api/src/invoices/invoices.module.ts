import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { PdfService } from './pdf.service';
import { InvoiceRemindersService } from './invoice-reminders.service';

@Module({
  imports: [NotificationsModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, PdfService, InvoiceRemindersService],
  exports: [InvoicesService],
})
export class InvoicesModule {}

