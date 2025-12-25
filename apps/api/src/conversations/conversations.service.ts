import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { prisma } from '@abel-labs/database';
import { AbelBot } from '@abel-labs/ai-agent';
import { ConversationMessage, ProjectType, Currency, ProjectStatus } from '@abel-labs/types';
import { generateSessionId } from '@abel-labs/utils';
import { NotificationsService } from '../notifications/notifications.service';
import { ProjectsService } from '../projects/projects.service';
import { InvoicesService } from '../invoices/invoices.service';
import { ProjectBriefsService } from '../project-briefs/project-briefs.service';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @Inject(AbelBot) private abelBot: AbelBot | null,
    private notificationsService: NotificationsService,
    private projectsService: ProjectsService,
    private invoicesService: InvoicesService,
    private projectBriefsService: ProjectBriefsService
  ) {}

  async createConversation(userId?: string) {
    const sessionId = generateSessionId();
    return prisma.aIConversation.create({
      data: {
        sessionId,
        userId,
        messages: [],
        status: 'ACTIVE',
      },
    });
  }

  async getConversation(sessionId: string) {
    const conversation = await prisma.aIConversation.findUnique({
      where: { sessionId },
      include: {
        projectBrief: {
          include: {
            project: {
              include: {
                invoices: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with session ID ${sessionId} not found`);
    }

    return conversation;
  }

  private extractContactInfo(messages: ConversationMessage[]): {
    name?: string;
    email?: string;
    phone?: string;
  } {
    const contactInfo: { name?: string; email?: string; phone?: string } = {};
    const allText = messages.map((m) => m.content).join(' ');

    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emailMatch = allText.match(emailRegex);
    if (emailMatch && emailMatch.length > 0) {
      contactInfo.email = emailMatch[0];
    }

    // Extract phone (various formats)
    const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g;
    const phoneMatch = allText.match(phoneRegex);
    if (phoneMatch && phoneMatch.length > 0) {
      contactInfo.phone = phoneMatch[0].trim();
    }

    // Extract name (look for patterns like "I'm [name]", "My name is [name]", "This is [name]")
    const namePatterns = [
      /(?:I'm|I am|my name is|this is|call me|I'm called)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /name[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    ];
    for (const pattern of namePatterns) {
      const match = allText.match(pattern);
      if (match && match[1]) {
        const potentialName = match[1].trim();
        // Basic validation: name should be 2-30 chars and not be common words
        if (potentialName.length >= 2 && potentialName.length <= 30 && !potentialName.match(/^(the|a|an|is|are|was|were)$/i)) {
          contactInfo.name = potentialName;
          break;
        }
      }
    }

    return contactInfo;
  }

  async addMessage(sessionId: string, content: string, role: 'user' | 'assistant' = 'user') {
    const conversation = await this.getConversation(sessionId);
    const messages = (conversation.messages as unknown) as ConversationMessage[];

    const newMessage: ConversationMessage = {
      role,
      content,
      timestamp: new Date(),
    };

    // Notify admin if this is the first user message
    const isFirstUserMessage = role === 'user' && messages.length === 0;
    if (isFirstUserMessage) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@abellabs.ca';
      const contactInfo = this.extractContactInfo([newMessage]);
      await this.notificationsService.notifyNewConversation(sessionId, adminEmail, content, contactInfo);
    }

    const updatedMessages = [...messages, newMessage];

    // Extract contact info from all messages
    const contactInfo = this.extractContactInfo(updatedMessages);
    const updateData: any = {
      messages: updatedMessages as any,
      status: 'ACTIVE',
    };

    // Update contact info if found
    if (contactInfo.name && !conversation.contactName) {
      updateData.contactName = contactInfo.name;
    }
    if (contactInfo.email && !conversation.contactEmail) {
      updateData.contactEmail = contactInfo.email;
    }
    if (contactInfo.phone && !conversation.contactPhone) {
      updateData.contactPhone = contactInfo.phone;
    }

    // Get AI response if user message
    if (role === 'user') {
      if (!this.abelBot) {
        updatedMessages.push({
          role: 'assistant',
          content: 'I apologize, the AI service is currently unavailable. Please contact us directly at (604) 977-6878 or hello@abellabs.ca for assistance.',
          timestamp: new Date(),
        });
      } else {
        try {
          const aiResponse = await this.abelBot.generateResponse(updatedMessages);
          updatedMessages.push({
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date(),
          });
        } catch (error: any) {
          console.error('Error generating AI response:', error);
          updatedMessages.push({
            role: 'assistant',
            content: 'I apologize, I encountered an error processing your message. Please try again or contact support if the issue persists.',
            timestamp: new Date(),
          });
        }

        // Detect intent
        try {
          const intent = await this.abelBot.detectIntent(updatedMessages);
          if (intent) {
            await prisma.aIConversation.update({
              where: { sessionId },
              data: { intent },
            });
          }
        } catch (error) {
          console.error('Error detecting intent:', error);
        }

        // Check if ready to create brief
        try {
          const shouldCreateBrief = await this.abelBot.shouldCreateBrief(updatedMessages);
          if (shouldCreateBrief && !conversation.projectBrief) {
            await this.generateProjectBrief(sessionId);
          }
        } catch (error) {
          console.error('Error checking brief creation:', error);
        }
      }
    }

    try {
      return await prisma.aIConversation.update({
        where: { sessionId },
        data: updateData,
      });
    } catch (error: any) {
      // If contact fields don't exist (migration not run), try without them
      if (error.message?.includes('Unknown arg') || error.message?.includes('contact')) {
        console.warn('⚠️ Contact fields not found in database. Run migration: npx prisma migrate dev --schema packages/database/prisma/schema.prisma');
        const { contactName, contactEmail, contactPhone, ...dataWithoutContact } = updateData;
        return await prisma.aIConversation.update({
          where: { sessionId },
          data: dataWithoutContact,
        });
      }
      throw error;
    }
  }

  async generateProjectBrief(sessionId: string) {
    if (!this.abelBot) {
      throw new Error('AI bot is not available. Please set GROQ_API_KEY in your environment variables.');
    }

    const conversation = await this.getConversation(sessionId);
    const messages = (conversation.messages as unknown) as ConversationMessage[];

    const briefData = await this.abelBot.generateProjectBrief(messages);
    if (!briefData) {
      throw new Error('Failed to generate project brief');
    }

    const brief = await prisma.projectBrief.create({
      data: {
        conversationId: sessionId,
        projectType: briefData.projectType,
        businessType: briefData.businessType,
        features: briefData.features,
        designPreferences: briefData.designPreferences,
        timeline: briefData.timeline,
        budgetRange: briefData.budgetRange,
        exampleWebsites: briefData.exampleWebsites || [],
        summary: briefData.summary,
        status: 'PENDING_REVIEW',
      },
      include: {
        conversation: {
          include: {
            user: true,
          },
        },
      },
    });

    await prisma.aIConversation.update({
      where: { sessionId },
      data: { status: 'COMPLETED' },
    });

    // Try auto-approval for standard projects
    const autoApproved = await this.tryAutoApprove(brief);
    
    if (!autoApproved) {
      // Notify admin about new brief that needs manual review
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@abellabs.ca';
      await this.notificationsService.notifyNewBrief(brief.id, adminEmail);
    }

    return brief;
  }

  /**
   * Attempts to auto-approve a brief if it meets criteria
   * Returns true if auto-approved, false if needs manual review
   */
  private async tryAutoApprove(brief: any): Promise<boolean> {
    // Check if auto-approval is enabled
    const autoApproveEnabled = process.env.AUTO_APPROVE_BRIEFS === 'true';
    if (!autoApproveEnabled) {
      this.logger.log(`Auto-approval disabled. Brief ${brief.id} requires manual review.`);
      return false;
    }

    // Auto-approve only standard website/portfolio projects
    const autoApproveTypes = [
      ProjectType.WEBSITE,
      ProjectType.PORTFOLIO,
      ProjectType.ECOMMERCE,
    ];

    if (!autoApproveTypes.includes(brief.projectType)) {
      this.logger.log(`Brief ${brief.id} is ${brief.projectType}, requires manual review.`);
      return false;
    }

    // Extract budget from budgetRange string (e.g., "70,000 - 100,000 ETB")
    const budgetInfo = this.extractBudgetFromRange(brief.budgetRange);
    if (!budgetInfo) {
      this.logger.log(`Could not extract budget from range: ${brief.budgetRange}`);
      return false;
    }

    // Check if budget is within auto-approve range
    const maxAutoApproveAmount = parseFloat(process.env.MAX_AUTO_APPROVE_AMOUNT || '200000');
    if (budgetInfo.amount > maxAutoApproveAmount) {
      this.logger.log(`Budget ${budgetInfo.amount} exceeds auto-approve limit ${maxAutoApproveAmount}`);
      return false;
    }

    // Calculate deadline (default: 6 weeks from now)
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 42); // 6 weeks

    try {
      // Auto-approve the brief
      await this.projectBriefsService.approve(brief.id, {
        approvedBudget: budgetInfo.amount,
        approvedCurrency: budgetInfo.currency,
        approvedDeadline: deadline,
        adminNotes: 'Auto-approved based on standard project criteria',
      });

      this.logger.log(`✅ Auto-approved brief ${brief.id} with budget ${budgetInfo.amount} ${budgetInfo.currency}`);

      // Get the updated brief with user info
      const approvedBrief = await this.projectBriefsService.findOne(brief.id);
      
      // Create project from approved brief
      if (approvedBrief.conversation?.user?.id) {
        // Use system/admin ID for auto-approval (or get from env)
        const adminId = process.env.ADMIN_USER_ID || approvedBrief.conversation.user.id;
        const project = await this.projectsService.createFromBrief(
          brief.id,
          adminId
        );

        this.logger.log(`✅ Created project ${project.id} from auto-approved brief`);

        // Create invoice for the project
        const invoice = await this.invoicesService.create(project.id, {
          amount: budgetInfo.amount,
          currency: budgetInfo.currency,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          items: [
            {
              description: `${brief.projectType} - ${brief.businessType || 'Project'}`,
              quantity: 1,
              unitPrice: budgetInfo.amount,
              total: budgetInfo.amount,
            },
          ],
        });

        this.logger.log(`✅ Created invoice ${invoice.invoiceNumber} for auto-approved project`);

        // Notify client
        if (approvedBrief.conversation?.user?.email) {
          await this.notificationsService.notifyBriefApproved(
            brief.id,
            approvedBrief.conversation.user.email,
            project.id
          );
        }

        return true;
      }
    } catch (error) {
      this.logger.error(`Failed to auto-approve brief ${brief.id}:`, error);
      return false;
    }

    return false;
  }

  /**
   * Extracts budget amount and currency from budgetRange string
   * Examples: "70,000 - 100,000 ETB" -> { amount: 85000, currency: 'ETB' }
   *           "$5,000 - $7,000 USD" -> { amount: 6000, currency: 'USD' }
   */
  private extractBudgetFromRange(budgetRange: string): { amount: number; currency: Currency } | null {
    if (!budgetRange) return null;

    // Remove currency symbols and extract numbers
    const cleanRange = budgetRange.replace(/[$,]/g, '').trim();
    
    // Extract currency
    let currency: Currency = Currency.ETB; // Default
    if (budgetRange.toUpperCase().includes('USD')) currency = Currency.USD;
    else if (budgetRange.toUpperCase().includes('CAD')) currency = Currency.CAD;
    else if (budgetRange.toUpperCase().includes('ETB')) currency = Currency.ETB;

    // Extract numbers (could be range like "70000 - 100000" or single "85000")
    const numbers = cleanRange.match(/\d+/g);
    if (!numbers || numbers.length === 0) return null;

    // If range, take average; if single, use that
    const amounts = numbers.map(n => parseFloat(n));
    const amount = amounts.length > 1 
      ? Math.round((amounts[0] + amounts[1]) / 2) // Average of range
      : amounts[0]; // Single amount

    return { amount, currency };
  }

  async getUserConversations(userId: string) {
    return prisma.aIConversation.findMany({
      where: { userId },
      include: {
        projectBrief: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllConversations() {
    return prisma.aIConversation.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        projectBrief: {
          select: {
            id: true,
            projectType: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

