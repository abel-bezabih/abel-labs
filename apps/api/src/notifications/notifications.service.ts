import { Injectable, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsService {
  constructor(@Optional() @InjectQueue('notifications') private notificationsQueue?: Queue) {}

  async sendEmail(to: string, subject: string, html: string, attachments?: Array<{ filename: string; content: Buffer }>) {
    // Queue email job if Redis is available, otherwise log directly
    if (this.notificationsQueue) {
      await this.notificationsQueue.add('send-email', {
        to,
        subject,
        html,
        attachments: attachments?.map(att => ({
          filename: att.filename,
          content: att.content.toString('base64'), // Convert buffer to base64 for queue
        })),
      });
    } else {
      // Fallback: log email when Redis is not available
      console.log('📧 Email (Redis unavailable):');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${html}`);
      if (attachments && attachments.length > 0) {
        console.log(`Attachments: ${attachments.map(a => a.filename).join(', ')}`);
      }
    }
  }

  async notifyNewBrief(briefId: string, adminEmail: string) {
    const subject = 'New Project Brief Ready for Review';
    const html = `
      <h2>New Project Brief Available</h2>
      <p>A new project brief has been created and is ready for your review.</p>
      <p><strong>Brief ID:</strong> ${briefId}</p>
      <p><a href="${process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3002'}/briefs/${briefId}">Review Brief</a></p>
    `;
    await this.sendEmail(adminEmail, subject, html);
  }

  async notifyBriefApproved(briefId: string, clientEmail: string, projectId: string) {
    const subject = 'Your Project Has Been Approved!';
    const html = `
      <h2>Great News!</h2>
      <p>Your project brief has been approved and a project has been created.</p>
      <p><strong>Project ID:</strong> ${projectId}</p>
      <p><a href="${process.env.CLIENT_PORTAL_URL || 'http://localhost:3000'}/dashboard">View Project</a></p>
    `;
    await this.sendEmail(clientEmail, subject, html);
  }

  async notifyInvoiceCreated(
    invoiceId: string,
    clientEmail: string,
    amount: number,
    currency: string,
    paymentUrl?: string,
  ) {
    const subject = 'Invoice Ready for Payment - Abel Labs';
    const portalUrl = process.env.CLIENT_PORTAL_URL || 'http://localhost:3000';
    const dashboardUrl = `${portalUrl}/dashboard`;
    const finalPaymentUrl = paymentUrl || `${portalUrl}/payment?invoiceId=${invoiceId}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #2563eb, #9333ea); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Invoice Ready for Payment</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your project invoice is ready</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear Valued Client,</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Your invoice is ready for payment. Please review the details below and complete your payment to get started.
          </p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Invoice ID:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">${invoiceId.substring(0, 8)}...</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount Due:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827; font-size: 18px;">${amount.toLocaleString()} ${currency}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${finalPaymentUrl}" 
               style="background: linear-gradient(to right, #2563eb, #9333ea); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; margin: 10px;">
              Pay Now
            </a>
            <a href="${dashboardUrl}" 
               style="background: white; color: #2563eb; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; border: 2px solid #2563eb; margin: 10px;">
              View Dashboard
            </a>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            If you have any questions or need assistance, please don't hesitate to contact us.
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 20px;">
            Best regards,<br>
            <strong>The Abel Labs Team</strong>
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Abel Labs | Professional Web Development & Software Solutions</p>
            <p>Email: hello@abellabs.ca | Phone: (604) 977-6878</p>
          </div>
        </div>
      </div>
    `;
    await this.sendEmail(clientEmail, subject, html);
  }

  async notifyPaymentReceived(paymentId: string, adminEmail: string, amount: number, currency: string) {
    const subject = 'Payment Received';
    const html = `
      <h2>New Payment Received</h2>
      <p>A payment has been successfully processed.</p>
      <p><strong>Amount:</strong> ${amount.toLocaleString()} ${currency}</p>
      <p><strong>Payment ID:</strong> ${paymentId}</p>
    `;
    await this.sendEmail(adminEmail, subject, html);
  }

  async notifyPaymentReceipt(
    clientEmail: string,
    invoiceNumber: string,
    amount: number,
    currency: string,
    downloadUrl: string,
    dashboardUrl: string,
    pdfBuffer?: Buffer,
  ) {
    const subject = `Receipt for Invoice ${invoiceNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #2563eb, #9333ea); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Payment Receipt</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your payment!</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear Valued Client,</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            We have successfully received your payment. Please find the details below:
          </p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Invoice Number:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">${invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount Paid:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827; font-size: 18px;">${amount.toLocaleString()} ${currency}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Date:</td>
                <td style="padding: 8px 0; text-align: right; color: #111827;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
            </table>
          </div>
          
          ${pdfBuffer ? `
            <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
              <p style="color: #065f46; font-size: 14px; margin: 0;">
                📎 Your invoice PDF is attached to this email.
              </p>
            </div>
          ` : ''}
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${downloadUrl}" 
               style="background: linear-gradient(to right, #2563eb, #9333ea); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; margin: 10px;">
              Download Invoice PDF
            </a>
            <a href="${dashboardUrl}" 
               style="background: white; color: #2563eb; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; border: 2px solid #2563eb; margin: 10px;">
              View Dashboard
            </a>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            If you have any questions or concerns, please don't hesitate to contact us.
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 20px;">
            Best regards,<br>
            <strong>The Abel Labs Team</strong>
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Abel Labs | Professional Web Development & Software Solutions</p>
            <p>Email: hello@abellabs.ca | Phone: (604) 977-6878</p>
          </div>
        </div>
      </div>
    `;
    
    const attachments = pdfBuffer ? [
      {
        filename: `invoice-${invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ] : undefined;
    
    await this.sendEmail(clientEmail, subject, html, attachments);
  }

  async notifyInvoiceOverdue(
    invoiceId: string,
    invoiceNumber: string,
    clientEmail: string,
    clientName: string,
    amount: number,
    currency: string,
    dueDate: Date,
    daysOverdue: number,
  ) {
    const subject = `Payment Reminder: Invoice ${invoiceNumber} is Overdue`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #ef4444, #dc2626); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Payment Reminder</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your invoice is overdue</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${clientName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            This is a friendly reminder that your invoice is now <strong>${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue</strong>.
          </p>
          
          <div style="background: #fef2f2; border: 2px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Invoice Number:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">${invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount Due:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #ef4444; font-size: 18px;">${amount.toLocaleString()} ${currency}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Due Date:</td>
                <td style="padding: 8px 0; text-align: right; color: #111827;">${new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Days Overdue:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #ef4444;">${daysOverdue}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.CLIENT_PORTAL_URL || 'http://localhost:3000'}/payment?invoiceId=${invoiceId}" 
               style="background: linear-gradient(to right, #2563eb, #9333ea); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; margin: 10px;">
              Pay Now
            </a>
            <a href="${process.env.CLIENT_PORTAL_URL || 'http://localhost:3000'}/dashboard" 
               style="background: white; color: #2563eb; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; border: 2px solid #2563eb; margin: 10px;">
              View Dashboard
            </a>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            If you have already made a payment, please ignore this reminder. If you have any questions or need assistance, please don't hesitate to contact us.
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 20px;">
            Best regards,<br>
            <strong>The Abel Labs Team</strong>
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Abel Labs | Professional Web Development & Software Solutions</p>
            <p>Email: hello@abellabs.ca | Phone: (604) 977-6878</p>
          </div>
        </div>
      </div>
    `;
    await this.sendEmail(clientEmail, subject, html);
  }

  async notifyNewConversation(sessionId: string, adminEmail: string, firstMessage: string, contactInfo?: { name?: string; email?: string; phone?: string }) {
    const subject = 'New Client Conversation Started';
    const contactSection = contactInfo && (contactInfo.name || contactInfo.email || contactInfo.phone)
      ? `
        <div style="background: #e3f2fd; padding: 12px; border-radius: 4px; margin: 12px 0;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">Contact Info:</h3>
          ${contactInfo.name ? `<p style="margin: 4px 0;"><strong>Name:</strong> ${contactInfo.name}</p>` : ''}
          ${contactInfo.email ? `<p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${contactInfo.email}">${contactInfo.email}</a></p>` : ''}
          ${contactInfo.phone ? `<p style="margin: 4px 0;"><strong>Phone:</strong> <a href="tel:${contactInfo.phone}">${contactInfo.phone}</a></p>` : ''}
        </div>
      `
      : '';
    const html = `
      <h2>New Client Conversation</h2>
      <p>A new conversation has started with a potential client.</p>
      <p><strong>Session ID:</strong> ${sessionId}</p>
      ${contactSection}
      <p><strong>First Message:</strong></p>
      <p style="background: #f5f5f5; padding: 12px; border-radius: 4px; margin: 8px 0;">${firstMessage.replace(/\n/g, '<br>')}</p>
      <p><a href="${process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3002'}/conversations/${sessionId}" style="background: linear-gradient(to right, #2563eb, #9333ea); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">View Conversation</a></p>
      <p><small>Time: ${new Date().toLocaleString()}</small></p>
    `;
    await this.sendEmail(adminEmail, subject, html);
  }
}

