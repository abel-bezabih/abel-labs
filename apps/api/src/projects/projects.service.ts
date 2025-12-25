import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { prisma } from '@abel-labs/database';
import { ProjectStatus, UserRole } from '@abel-labs/types';

@Injectable()
export class ProjectsService {
  async findAll(userId?: string, role?: UserRole) {
    if (role === UserRole.CLIENT) {
      return prisma.project.findMany({
        where: { clientId: userId },
        include: {
          client: { select: { id: true, name: true, email: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          brief: true,
          invoices: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return prisma.project.findMany({
      include: {
        client: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        brief: true,
        invoices: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string, role?: UserRole) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        brief: true,
        invoices: { include: { payments: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (role === UserRole.CLIENT && project.clientId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return project;
  }

  async createFromBrief(briefId: string, _adminId: string) {
    const brief = await prisma.projectBrief.findUnique({
      where: { id: briefId },
      include: {
        conversation: {
          select: { userId: true },
        },
      },
    });

    if (!brief) {
      throw new NotFoundException(`Brief with ID ${briefId} not found`);
    }

    if (!brief.approvedBudget || !brief.approvedCurrency || !brief.approvedDeadline) {
      throw new Error('Brief must be approved with budget, currency, and deadline');
    }

    return prisma.project.create({
      data: {
        title: `${brief.businessType || 'Project'} - ${brief.projectType}`,
        description: brief.summary,
        type: brief.projectType,
        status: ProjectStatus.APPROVED,
        clientId: brief.conversation?.userId || '', // Should be set from conversation
        briefId: brief.id,
        budget: brief.approvedBudget,
        currency: brief.approvedCurrency,
        deadline: brief.approvedDeadline,
      },
      include: {
        brief: true,
        client: true,
      },
    });
  }

  async updateStatus(id: string, status: ProjectStatus, userId: string, role: UserRole) {
    await this.findOne(id, userId, role); // Validate access

    if (role === UserRole.CLIENT && status !== ProjectStatus.REVIEW) {
      throw new ForbiddenException('Clients can only request review');
    }

    return prisma.project.update({
      where: { id },
      data: { status },
    });
  }

  async assignDeveloper(projectId: string, developerId: string) {
    return prisma.project.update({
      where: { id: projectId },
      data: { assignedToId: developerId },
    });
  }
}

