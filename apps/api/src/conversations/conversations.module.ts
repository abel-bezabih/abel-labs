import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { AbelBot } from '@abel-labs/ai-agent';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProjectsModule } from '../projects/projects.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { ProjectBriefsModule } from '../project-briefs/project-briefs.module';

@Module({
  imports: [NotificationsModule, ProjectsModule, InvoicesModule, ProjectBriefsModule],
  controllers: [ConversationsController],
  providers: [
    ConversationsService,
    {
      provide: AbelBot,
      useFactory: () => {
        const apiKey = process.env.GROQ_API_KEY || '';
        if (!apiKey) {
          console.warn('⚠️  GROQ_API_KEY is not set. AI bot features will be disabled.');
          console.warn('   Server will start, but chat functionality will be limited.');
          return null as any; // Will be handled by service
        }
        console.log('✅ AbelBot initialized with Groq API key');
        return new AbelBot(apiKey);
      },
    },
  ],
  exports: [ConversationsService],
})
export class ConversationsModule {}

