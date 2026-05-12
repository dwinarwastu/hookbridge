import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { WebhookLog } from 'src/common/entities/webhook-log.entity';
import { WebhookStatus } from 'src/common/enums/webhook-status.enum';
import { ProviderEnum } from 'src/common/enums/provider.enum';
import { ProviderService } from 'src/provider/provider.service';
import { QUEUE_NAMES } from 'src/queue/queue.module';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(WebhookLog)
    private readonly webhookLogRepository: Repository<WebhookLog>,
    @InjectQueue(QUEUE_NAMES.WEBHOOK)
    private readonly webhookQueue: Queue,
    private readonly providerService: ProviderService,
  ) {}

  async receive(
    provider: ProviderEnum,
    payload: Buffer,
    headers: Record<string, unknown>,
  ): Promise<{ id: string; status: string }> {
    const providerHandler = this.providerService.getProvider(provider);

    const isValid = providerHandler.validate(payload, headers);
    if (!isValid) throw new BadRequestException('Invalid webhook signature');

    const parsedPayload = payload as unknown as Record<string, unknown>;
    const eventType = providerHandler.extractEventType(parsedPayload);

    const log = this.webhookLogRepository.create({
      provider,
      eventType,
      payload: parsedPayload,
      headers,
      status: WebhookStatus.RECEIVED,
    });

    await this.webhookLogRepository.save(log);

    await this.webhookQueue.add(
      'process',
      { logId: log.id, provider, eventType, payload: parsedPayload, headers },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(`Webhook received from ${provider} [logId: ${log.id}]`);

    return { id: log.id, status: log.status };
  }

  async getStatus(id: string): Promise<WebhookLog> {
    const log = await this.webhookLogRepository.findOne({ where: { id } });
    if (!log) throw new BadRequestException('Webhook log not found');
    return log;
  }
}
