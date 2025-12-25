import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@abel-labs/database';
import { ProjectStatus, Currency } from '@abel-labs/types';
import { NotificationsService } from '../notifications/notifications.service';
import { ProjectsService } from '../projects/projects.service';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class ProjectBriefsService {
  constructor(
    private notificationsService: NotificationsService,
    private projectsService: ProjectsService,
    private invoicesService: InvoicesService,
  ) {}
  async findAll(status?: ProjectStatus) {
    return prisma.projectBrief.findMany({
      where: status ? { status } : undefined,
      include: {
        conversation: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string, userRole?: string) {
    const brief = await prisma.projectBrief.findUnique({
      where: { id },
      include: {
        conversation: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
        project: {
          include: {
            invoices: {
              orderBy: { createdAt: 'desc' },
              take: 1, // Get latest invoice
            },
          },
        },
      },
    });

    if (!brief) {
      throw new NotFoundException(`Project brief with ID ${id} not found`);
    }

    // If user is a CLIENT, only allow viewing their own briefs
    if (userRole === 'CLIENT' && userId) {
      if (brief.conversation?.userId !== userId) {
        throw new NotFoundException(`Project brief with ID ${id} not found`);
      }
    }

    return brief;
  }

  async approve(
    id: string,
    data: {
      approvedBudget: number;
      approvedCurrency: Currency;
      approvedDeadline: Date | string;
      adminNotes?: string;
    }
  ) {
    const deadline = typeof data.approvedDeadline === 'string' 
      ? new Date(data.approvedDeadline) 
      : data.approvedDeadline;
    
    const brief = await prisma.projectBrief.update({
      where: { id },
      data: {
        status: ProjectStatus.APPROVED,
        approvedBudget: data.approvedBudget,
        approvedCurrency: data.approvedCurrency,
        approvedDeadline: deadline,
        adminNotes: data.adminNotes,
      },
      include: {
        conversation: {
          include: {
            user: true,
          },
        },
      },
    });

    // Auto-create project and draft invoice (Hybrid approach)
    let projectId = '';
    try {
      // Create project from approved brief
      const project = await this.projectsService.createFromBrief(brief.id, 'system');
      projectId = project.id;

      // Auto-create draft invoice (admin can review/edit before sending)
      const dueDate = new Date(deadline);
      dueDate.setDate(dueDate.getDate() - 7); // Due date is 7 days before project deadline

      await this.invoicesService.create(project.id, {
        amount: data.approvedBudget,
        currency: data.approvedCurrency,
        dueDate,
        items: [
          {
            description: `${brief.businessType || 'Project'} - ${brief.projectType}`,
            quantity: 1,
            unitPrice: data.approvedBudget,
            total: data.approvedBudget,
          },
        ],
      });

      // Notify client about approval (but invoice is still DRAFT, not sent yet)
      if (brief.conversation?.user?.email) {
        await this.notificationsService.notifyBriefApproved(
          brief.id,
          brief.conversation.user.email,
          project.id
        );
      }
    } catch (error) {
      console.error('Error creating project/invoice from brief:', error);
      // Continue even if project/invoice creation fails - admin can create manually
    }

    return { ...brief, projectId };
  }

  async reject(id: string, adminNotes: string) {
    return prisma.projectBrief.update({
      where: { id },
      data: {
        status: ProjectStatus.CANCELLED,
        adminNotes,
      },
    });
  }
}

