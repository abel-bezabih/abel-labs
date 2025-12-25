import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@abel-labs/types';
import { CreateConversationDto, AddMessageDto } from './dto/conversation.dto';

@ApiTags('conversations')
@Controller('conversations')
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  async createConversation(@Body() dto: CreateConversationDto) {
    return this.conversationsService.createConversation(dto.userId);
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'Get conversation by session ID' })
  async getConversation(@Param('sessionId') sessionId: string) {
    return this.conversationsService.getConversation(sessionId);
  }

  @Post(':sessionId/messages')
  @ApiOperation({ summary: 'Add a message to conversation' })
  async addMessage(@Param('sessionId') sessionId: string, @Body() dto: AddMessageDto) {
    return this.conversationsService.addMessage(sessionId, dto.content);
  }

  @Post(':sessionId/generate-brief')
  @ApiOperation({ summary: 'Generate project brief from conversation' })
  async generateBrief(@Param('sessionId') sessionId: string) {
    return this.conversationsService.generateProjectBrief(sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/my-conversations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user conversations' })
  async getUserConversations(@Request() req) {
    return this.conversationsService.getUserConversations(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all conversations (Admin only)' })
  async getAllConversations() {
    return this.conversationsService.getAllConversations();
  }
}



