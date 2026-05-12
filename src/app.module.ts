import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookModule } from './webhook/webhook.module';
import { QueueModule } from './queue/queue.module';
import { ProviderModule } from './provider/provider.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [WebhookModule, QueueModule, ProviderModule, SubscriptionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
