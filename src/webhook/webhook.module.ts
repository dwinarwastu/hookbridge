import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WebhookLog } from 'src/common/entities/webhook-log.entity';
import { QueueModule } from 'src/queue/queue.module';
import { ProviderModule } from 'src/provider/provider.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookLog]),
    QueueModule,
    ProviderModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
