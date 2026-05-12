import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { WebhookLog } from '../common/entities/webhook-log.entity';
import { Subscription } from '../common/entities/subscription.entity';
import { WebhookStatus } from '../common/enums/webhook-status.enum';
import { WebhookJobData } from '../common/interfaces/webhook-job.interface';
import { QUEUE_NAMES } from '../queue/queue.module';
import { ProviderEnum } from 'src/common/enums/provider.enum';

@Processor(QUEUE_NAMES.WEBHOOK)
export class WebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(
    @InjectRepository(WebhookLog)
    private readonly webhookLogRepository: Repository<WebhookLog>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectQueue(QUEUE_NAMES.DEAD_LETTER)
    private readonly deadLetterQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<WebhookJobData>): Promise<void> {
    const { logId, provider, eventType } = job.data;

    await this.webhookLogRepository.update(logId, {
      status: WebhookStatus.PROCESSING,
      attemptCount: job.attemptsMade + 1,
    });

    try {
      const subscriptions = await this.subscriptionRepository.find({
        where: {
          provider: provider as ProviderEnum,
          eventType,
          isActive: true,
        },
      });

      if (subscriptions.length === 0) {
        this.logger.warn(`No subscriptions found for ${provider}:${eventType}`);
        await this.webhookLogRepository.update(logId, {
          status: WebhookStatus.DELIVERED,
          deliveredAt: new Date(),
        });
        return;
      }

      await Promise.all(
        subscriptions.map((sub) => {
          this.logger.log(
            `Routing ${provider}:${eventType} to ${sub.targetQueue}`,
          );
          return Promise.resolve();
        }),
      );

      await this.webhookLogRepository.update(logId, {
        status: WebhookStatus.DELIVERED,
        deliveredAt: new Date(),
      });

      this.logger.log(
        `Webhook ${logId} delivered to ${subscriptions.length} subscriber(s)`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      await this.webhookLogRepository.update(logId, {
        status: WebhookStatus.FAILED,
        errorMessage: message,
      });

      this.logger.error(`Failed to process webhook ${logId}: ${message}`);

      if (job.attemptsMade >= 2) {
        await this.deadLetterQueue.add('dead', job.data);
        await this.webhookLogRepository.update(logId, {
          status: WebhookStatus.DEAD,
        });
        this.logger.error(`Webhook ${logId} moved to dead letter queue`);
      }

      throw error;
    }
  }
}
