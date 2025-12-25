import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { prisma } from '@abel-labs/database';
import { InvoiceStatus } from '@abel-labs/types';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class InvoiceRemindersService {
  private readonly logger = new Logger(InvoiceRemindersService.name);

  constructor(private notificationsService: NotificationsService) {}

  /**
   * Check for overdue invoices and send reminders
   * Runs daily at 9 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM, {
    name: 'check-overdue-invoices',
    timeZone: 'America/Vancouver',
  })
  async checkOverdueInvoices() {
    this.logger.log('🔍 Checking for overdue invoices...');

    try {
      const now = new Date();
      
      // Find all unpaid invoices that are past due date
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          status: {
            in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE],
          },
          dueDate: {
            lt: now, // Due date is in the past
          },
        },
        include: {
          project: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(`📋 Found ${overdueInvoices.length} overdue invoice(s)`);

      let remindersSent = 0;

      for (const invoice of overdueInvoices) {
        // Skip if no client email
        if (!invoice.project?.client?.email) {
          this.logger.warn(`⚠️ Invoice ${invoice.invoiceNumber} has no client email, skipping reminder`);
          continue;
        }

        // Calculate days overdue
        const daysOverdue = Math.floor(
          (now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Only send reminders for invoices that are at least 1 day overdue
        // And send reminders on specific days (1, 3, 7, 14, 30 days overdue)
        const reminderDays = [1, 3, 7, 14, 30];
        if (!reminderDays.includes(daysOverdue)) {
          continue;
        }

        try {
          // Update invoice status to OVERDUE if not already
          if (invoice.status !== InvoiceStatus.OVERDUE) {
            await prisma.invoice.update({
              where: { id: invoice.id },
              data: { status: InvoiceStatus.OVERDUE },
            });
            this.logger.log(`✅ Updated invoice ${invoice.invoiceNumber} status to OVERDUE`);
          }

          // Send reminder email
          await this.notificationsService.notifyInvoiceOverdue(
            invoice.id,
            invoice.invoiceNumber,
            invoice.project.client.email,
            invoice.project.client.name,
            invoice.amount,
            invoice.currency,
            invoice.dueDate,
            daysOverdue,
          );

          remindersSent++;
          this.logger.log(
            `✅ Sent overdue reminder for invoice ${invoice.invoiceNumber} to ${invoice.project.client.email} (${daysOverdue} days overdue)`
          );
        } catch (error: any) {
          this.logger.error(
            `❌ Failed to send reminder for invoice ${invoice.invoiceNumber}: ${error.message}`
          );
        }
      }

      this.logger.log(`✅ Payment reminder check completed. Sent ${remindersSent} reminder(s)`);
    } catch (error: any) {
      this.logger.error(`❌ Error checking overdue invoices: ${error.message}`);
    }
  }

  /**
   * Manual trigger for testing (can be called via API endpoint)
   */
  async sendOverdueReminders() {
    this.logger.log('🔍 Manually triggering overdue invoice check...');
    await this.checkOverdueInvoices();
  }
}








