import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UserRole } from '@abel-labs/types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: await this.generateRefreshToken(user.id),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    };
  }

  async register(email: string, password: string, name: string, role?: UserRole) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('An account with this email already exists. Please log in instead.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
      role: role || UserRole.CLIENT,
    });

    return this.login(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);
      
      // Check if it's a refresh token
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Get the user
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const newPayload = { email: user.email, sub: user.id, role: user.role };
      return {
        accessToken: this.jwtService.sign(newPayload),
        refreshToken: await this.generateRefreshToken(user.id),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    // Generate refresh token with longer expiration (7 days)
    return this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn: '7d' }
    );
  }

  async forgotPassword(email: string) {
    console.log(`\n🔐 Forgot password requested for: ${email}`);
    const user = await this.usersService.findByEmail(email);
    
    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      console.log(`   ❌ User not found for email: ${email}`);
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    console.log(`   ✅ User found: ${user.name} (${user.id})`);

    try {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

      console.log(`   🔑 Generated reset token: ${resetToken.substring(0, 8)}...`);

      // Save token to user
      await this.usersService.updatePasswordResetToken(user.id, resetToken, resetExpires);
      console.log(`   💾 Token saved to database`);

      // Send email with reset link
      const resetUrl = `${process.env.CLIENT_PORTAL_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      const subject = 'Reset Your Password - Abel Labs';
      const html = `
        <h2>Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <p><a href="${resetUrl}" style="background: linear-gradient(to right, #2563eb, #9333ea); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 16px 0;">Reset Password</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Abel Labs Team</p>
      `;

      await this.notificationsService.sendEmail(user.email, subject, html);
      console.log(`   📧 Email queued for: ${user.email}`);

      // Always log the reset link in development/local environments
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔑 PASSWORD RESET LINK:`);
      console.log(`${'='.repeat(60)}`);
      console.log(`${resetUrl}`);
      console.log(`${'='.repeat(60)}\n`);

      return { 
        message: 'If an account with that email exists, a password reset link has been sent.',
        // Always include reset link in response for local development
        resetLink: resetUrl
      };
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      // Still return success message for security (don't reveal if email failed)
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByPasswordResetToken(token);
    
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
      throw new BadRequestException('Reset token has expired. Please request a new one.');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.usersService.updatePassword(user.id, hashedPassword);
    await this.usersService.clearPasswordResetToken(user.id);

    // Send confirmation email
    const subject = 'Password Reset Successful - Abel Labs';
    const html = `
      <h2>Password Reset Successful</h2>
      <p>Hi ${user.name},</p>
      <p>Your password has been successfully reset.</p>
      <p>If you didn't make this change, please contact us immediately.</p>
      <p>Best regards,<br>The Abel Labs Team</p>
    `;

    await this.notificationsService.sendEmail(user.email, subject, html);

    return { message: 'Password has been reset successfully' };
  }
}

