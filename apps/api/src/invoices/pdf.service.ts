import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Currency } from '@abel-labs/types';

// Extended Invoice type that includes project relation
interface InvoiceWithProject {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: Currency;
  status: string;
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  project?: {
    title: string;
    client?: {
      name: string;
      email: string;
      phone?: string;
    };
  };
}

@Injectable()
export class PdfService {
  /**
   * Generate PDF invoice
   */
  async generateInvoicePdf(invoice: InvoiceWithProject): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Header
        doc
          .fontSize(24)
          .fillColor('#2563eb')
          .text('Abel Labs', 50, 50)
          .fontSize(10)
          .fillColor('#6b7280')
          .text('Professional Web Development & Software Solutions', 50, 75);

        // Invoice Title
        doc
          .fontSize(20)
          .fillColor('#111827')
          .text('INVOICE', 50, 120);

        // Invoice Details
        const invoiceY = 150;
        doc
          .fontSize(10)
          .fillColor('#6b7280')
          .text('Invoice Number:', 50, invoiceY)
          .fillColor('#111827')
          .fontSize(12)
          .text(invoice.invoiceNumber, 150, invoiceY)
          .fontSize(10)
          .fillColor('#6b7280')
          .text('Date:', 50, invoiceY + 20)
          .fillColor('#111827')
          .text(new Date(invoice.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }), 150, invoiceY + 20)
          .fillColor('#6b7280')
          .text('Due Date:', 50, invoiceY + 40)
          .fillColor('#111827')
          .text(new Date(invoice.dueDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }), 150, invoiceY + 40)
          .fillColor('#6b7280')
          .text('Status:', 50, invoiceY + 60)
          .fillColor(this.getStatusColor(invoice.status))
          .text(invoice.status, 150, invoiceY + 60);

        // Client Information
        if (invoice.project?.client) {
          const clientY = invoiceY + 100;
          doc
            .fontSize(12)
            .fillColor('#111827')
            .text('Bill To:', 350, clientY)
            .fontSize(10)
            .fillColor('#6b7280')
            .text(invoice.project.client.name, 350, clientY + 20)
            .text(invoice.project.client.email, 350, clientY + 35);
          
          if (invoice.project.client.phone) {
            doc.text(invoice.project.client.phone, 350, clientY + 50);
          }
        }

        // Project Information
        if (invoice.project) {
          doc
            .fontSize(10)
            .fillColor('#6b7280')
            .text('Project:', 50, invoiceY + 100)
            .fillColor('#111827')
            .text(invoice.project.title, 150, invoiceY + 100);
        }

        // Items Table
        const tableY = invoiceY + 140;
        doc
          .fontSize(10)
          .fillColor('#6b7280')
          .text('Description', 50, tableY)
          .text('Qty', 350, tableY)
          .text('Unit Price', 400, tableY)
          .text('Total', 500, tableY);

        // Draw line
        doc
          .moveTo(50, tableY + 15)
          .lineTo(550, tableY + 15)
          .strokeColor('#e5e7eb')
          .lineWidth(1)
          .stroke();

        // Invoice Items
        const items = invoice.items as Array<{
          description: string;
          quantity: number;
          unitPrice: number;
          total: number;
        }>;

        let currentY = tableY + 30;
        items.forEach((item) => {
          doc
            .fillColor('#111827')
            .fontSize(10)
            .text(item.description, 50, currentY, { width: 280 })
            .text(item.quantity.toString(), 350, currentY)
            .text(this.formatCurrency(item.unitPrice, invoice.currency), 400, currentY, { align: 'right' })
            .text(this.formatCurrency(item.total, invoice.currency), 500, currentY, { align: 'right' });
          currentY += 20;
        });

        // Totals
        const totalsY = currentY + 20;
        doc
          .moveTo(400, totalsY)
          .lineTo(550, totalsY)
          .strokeColor('#e5e7eb')
          .lineWidth(1)
          .stroke();

        doc
          .fontSize(12)
          .fillColor('#111827')
          .text('Subtotal:', 400, totalsY + 10, { align: 'right' })
          .text(this.formatCurrency(invoice.amount, invoice.currency), 500, totalsY + 10, { align: 'right' });

        // Total
        doc
          .fontSize(14)
          .fillColor('#111827')
          .text('Total:', 400, totalsY + 35, { align: 'right' })
          .fontSize(16)
          .fillColor('#2563eb')
          .text(this.formatCurrency(invoice.amount, invoice.currency), 500, totalsY + 35, { align: 'right' });

        // Payment Information
        if (invoice.status === 'PAID' && invoice.paidAt) {
          doc
            .fontSize(10)
            .fillColor('#10b981')
            .text(`Paid on ${new Date(invoice.paidAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}`, 50, totalsY + 80);
        }

        // Footer
        const footerY = 750;
        doc
          .fontSize(8)
          .fillColor('#9ca3af')
          .text('Thank you for your business!', 50, footerY, { align: 'center' })
          .text('Questions? Contact us at hello@abellabs.ca or (604) 977-6878', 50, footerY + 15, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private formatCurrency(amount: number, currency: Currency): string {
    const symbols: Record<Currency, string> = {
      USD: '$',
      CAD: 'C$',
      ETB: 'ETB ',
    };

    return `${symbols[currency] || ''}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PAID: '#10b981',
      SENT: '#3b82f6',
      DRAFT: '#6b7280',
      OVERDUE: '#ef4444',
      CANCELLED: '#9ca3af',
    };
    return colors[status] || '#6b7280';
  }
}




