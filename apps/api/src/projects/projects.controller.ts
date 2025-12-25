import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProjectStatusDto } from './dto/project.dto';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  async findAll(@Request() req) {
    return this.projectsService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.id, req.user.role);
  }

  @Post('from-brief/:briefId')
  @ApiOperation({ summary: 'Create project from approved brief' })
  async createFromBrief(@Param('briefId') briefId: string, @Request() req) {
    return this.projectsService.createFromBrief(briefId, req.user.id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update project status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProjectStatusDto,
    @Request() req
  ) {
    return this.projectsService.updateStatus(id, dto.status, req.user.id, req.user.role);
  }
}

