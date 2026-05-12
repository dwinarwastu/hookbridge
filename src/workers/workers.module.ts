import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookLog } from '../common/entities/webhook-log.entity';
import { Subscription } from '../common/entities/subscription.entity';
import { WebhookProcessor } from './webhook.processor';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookLog, Subscription]), QueueModule],
  providers: [WebhookProcessor],
})
export class WorkersModule {}
