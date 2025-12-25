import { Module } from '@nestjs/common';
import { ProjectBriefsService } from './project-briefs.service';
import { ProjectBriefsController } from './project-briefs.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProjectsModule } from '../projects/projects.module';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [NotificationsModule, ProjectsModule, InvoicesModule],
  controllers: [ProjectBriefsController],
  providers: [ProjectBriefsService],
  exports: [ProjectBriefsService],
})
export class ProjectBriefsModule {}

