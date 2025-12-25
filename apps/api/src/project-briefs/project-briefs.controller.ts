import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectBriefsService } from './project-briefs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@abel-labs/types';
import { ApproveBriefDto, RejectBriefDto } from './dto/brief.dto';

@ApiTags('project-briefs')
@Controller('project-briefs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProjectBriefsController {
  constructor(private briefsService: ProjectBriefsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all project briefs (Admin only)' })
  async findAll(@Param('status') status?: string) {
    return this.briefsService.findAll(status as any);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project brief by ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    // If authenticated, check ownership. If not, allow public access (for status checking)
    return this.briefsService.findOne(id, req.user?.id, req.user?.role);
  }

  @Put(':id/approve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve project brief (Admin only)' })
  async approve(@Param('id') id: string, @Body() dto: ApproveBriefDto) {
    return this.briefsService.approve(id, dto);
  }

  @Put(':id/reject')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reject project brief (Admin only)' })
  async reject(@Param('id') id: string, @Body() dto: RejectBriefDto) {
    return this.briefsService.reject(id, dto.adminNotes);
  }
}







