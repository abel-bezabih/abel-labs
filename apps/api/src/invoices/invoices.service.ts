import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@abel-labs/database';
import { InvoiceStatus, Currency } from '@abel-labs/types';
import { generateInvoiceNumber } from '@abel-labs/utils';
import { NotificationsService } from '../notifications/notifications.service';
import { PdfService } from './pdf.service';

@Injectable()
export class InvoicesService {
  constructor(
    private notificationsService: NotificationsService,
    private pdfService: PdfService,
  ) {}
  async findAll(projectId?: string, userId?: string, userRole?: string) {
    const where: any = {};
    
    if (projectId) {
      where.projectId = projectId;
    }
    
    // If user is a CLIENT, only show invoices for their projects
    if (userId && userRole === 'CLIENT') {
      where.project = {
        clientId: userId,
      };
    }
    
    return prisma.invoice.findMany({
      where,
      include: {
        project: {
          include: {
            client: { select: { id: true, name: true, email: true } },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            client: true,
          },
        },
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async create(projectId: string, data: {
    amount: number;
    currency: Currency;
    dueDate: Date | string;
    items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  }) {
    const dueDate = typeof data.dueDate === 'string' ? new Date(data.dueDate) : data.dueDate;
    const invoice = await prisma.invoice.create({
      data: {
        projectId,
        invoiceNumber: generateInvoiceNumber(),
        amount: data.amount,
        currency: data.currency,
        dueDate,
        items: data.items as any,
        status: InvoiceStatus.DRAFT,
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    // Don't notify client yet - invoice is DRAFT, admin will send it manually
    // This allows admin to review/edit before sending

    return invoice;
  }

  async updateStatus(id: string, status: InvoiceStatus) {
    return prisma.invoice.update({
      where: { id },
      data: {
        status,
        ...(status === InvoiceStatus.PAID && { paidAt: new Date() }),
      },
    });
  }

  async update(id: string, data: {
    amount?: number;
    currency?: Currency;
    dueDate?: Date | string;
    items?: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  }) {
    const updateData: any = {};
    
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.dueDate !== undefined) {
      updateData.dueDate = typeof data.dueDate === 'string' ? new Date(data.dueDate) : data.dueDate;
    }
    if (data.items !== undefined) updateData.items = data.items as any;

    return prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });
  }

  /**
   * Send invoice to client (change status to SENT and email with payment link)
   */
  async sendInvoice(id: string): Promise<any> {
    const invoice = await this.findOne(id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new Error(`Invoice ${invoice.invoiceNumber} is not in DRAFT status`);
    }

    // Update status to SENT
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.SENT,
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    // Send email with payment link
    if (updatedInvoice.project.client?.email) {
      const portalUrl = process.env.CLIENT_PORTAL_URL || 'http://localhost:3000';
      const paymentUrl = `${portalUrl}/payment?invoiceId=${invoice.id}`;
      
      await this.notificationsService.notifyInvoiceCreated(
        invoice.id,
        updatedInvoice.project.client.email,
        invoice.amount,
        invoice.currency,
        paymentUrl
      );
    }

    return updatedInvoice;
  }

  /**
   * Generate PDF for invoice
   */
  async generatePdf(id: string): Promise<Buffer> {
    const invoice = await this.findOne(id);
    return this.pdfService.generateInvoicePdf(invoice as any);
  }
}

