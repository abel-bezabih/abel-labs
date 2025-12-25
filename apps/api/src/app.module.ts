import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ConversationsModule } from './conversations/conversations.module';
import { PaymentsModule } from './payments/payments.module';
import { InvoicesModule } from './invoices/invoices.module';
import { HealthModule } from './health/health.module';
import { ProjectBriefsModule } from './project-briefs/project-briefs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env.local',
        '.env',
        '../../.env.local',
        '../../.env',
      ],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      useFactory: () => {
        const host = process.env.REDIS_HOST || 'localhost';
        const port = parseInt(process.env.REDIS_PORT || '6380');
        console.log(`📡 Attempting to connect to Redis at ${host}:${port}...`);
        return {
          connection: {
            host,
            port,
            retryStrategy: (times: number) => {
              // Retry with exponential backoff, max 3 times
              if (times < 3) {
                return Math.min(times * 200, 2000);
              }
              console.warn(`⚠️  Redis connection failed after ${times} attempts. Server will continue without Redis.`);
              return null; // Stop retrying
            },
            connectTimeout: 3000, // 3 second timeout
            lazyConnect: false, // Connect immediately but with timeout
            enableOfflineQueue: false, // Don't queue commands if disconnected
            enableReadyCheck: false, // Don't wait for ready check
            maxRetriesPerRequest: 1, // Fail fast
          },
        };
      },
    }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    ConversationsModule,
    PaymentsModule,
    InvoicesModule,
    HealthModule,
    ProjectBriefsModule,
    NotificationsModule,
    LeadsModule,
  ],
})
export class AppModule {}
