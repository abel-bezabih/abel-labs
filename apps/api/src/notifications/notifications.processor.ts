import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private transporter: nodemailer.Transporter;

  constructor() {
    super();
    // Configure email transporter
    // For production, use SendGrid, Mailgun, or AWS SES
    // For development, use console logging or Mailtrap
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async process(job: Job) {
    if (job.name === 'send-email') {
      const { to, subject, html, attachments } = job.data;

      // Convert base64 attachments back to buffers
      const emailAttachments = attachments?.map((att: { filename: string; content: string }) => ({
        filename: att.filename,
        content: Buffer.from(att.content, 'base64'),
      }));

      // In development, just log. In production, send real email
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email would be sent:');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${html}`);
        if (emailAttachments && emailAttachments.length > 0) {
          console.log(`Attachments: ${emailAttachments.map((a: { filename: string }) => a.filename).join(', ')}`);
        }
        return;
      }

      try {
        await this.transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@abellabs.ca',
          to,
          subject,
          html,
          attachments: emailAttachments,
        });
        console.log(`✅ Email sent to ${to}${emailAttachments && emailAttachments.length > 0 ? ` with ${emailAttachments.length} attachment(s)` : ''}`);
      } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error);
        throw error;
      }
    }
  }
}



