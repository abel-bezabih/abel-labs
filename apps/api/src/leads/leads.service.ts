import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateLeadDto } from './dto/lead.dto';

@Injectable()
export class LeadsService {
  constructor(private notificationsService: NotificationsService) {}

  async createLead(dto: CreateLeadDto) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@abellabs.ca';
    
    // Send email to admin
    const adminSubject = `New Lead: ${dto.name}`;
    const adminHtml = `
      <h2>New Lead Submission</h2>
      <p><strong>Name:</strong> ${dto.name}</p>
      <p><strong>Email:</strong> ${dto.email}</p>
      <p><strong>Project Details:</strong></p>
      <p>${dto.project.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>Submitted at ${new Date().toLocaleString()}</small></p>
    `;
    await this.notificationsService.sendEmail(adminEmail, adminSubject, adminHtml);

    // Send confirmation email to lead
    const clientSubject = 'Thank you for contacting Abel Labs!';
    const clientHtml = `
      <h2>Hi ${dto.name},</h2>
      <p>Thanks for reaching out! We've received your project inquiry and will review it within 24 hours.</p>
      <p>In the meantime, feel free to chat with our AI agent to get an instant quote:</p>
      <p><a href="${process.env.CLIENT_PORTAL_URL || 'http://localhost:3000'}/chat" style="background: linear-gradient(to right, #2563eb, #9333ea); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">Start AI Chat</a></p>
      <p>Best regards,<br>The Abel Labs Team</p>
    `;
    await this.notificationsService.sendEmail(dto.email, clientSubject, clientHtml);

    return {
      success: true,
      message: 'Lead submitted successfully. We will contact you within 24 hours.',
    };
  }
}



