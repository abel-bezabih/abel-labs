import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { prisma, Prisma } from '@abel-labs/database';
import { UserRole } from '@abel-labs/types';

@Injectable()
export class UsersService {
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
    phone?: string;
  }) {
    try {
      return await prisma.user.create({
        data,
      });
    } catch (error) {
      // Handle Prisma unique constraint violation
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Unique constraint failed
          const target = error.meta?.target as string[] | undefined;
          if (target?.includes('email')) {
            throw new ConflictException('An account with this email already exists. Please log in instead.');
          }
          throw new BadRequestException('A record with these details already exists.');
        }
      }
      // Re-throw if it's not a known Prisma error
      throw error;
    }
  }

  async update(id: string, data: Partial<{ name: string; phone: string; avatar: string }>) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updatePasswordResetToken(userId: string, token: string, expiresAt: Date) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expiresAt,
      },
    });
  }

  async findByPasswordResetToken(token: string) {
    return prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  }

  async clearPasswordResetToken(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }
}







