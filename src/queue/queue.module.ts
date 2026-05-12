import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

export const QUEUE_NAMES = {
  WEBHOOK: 'webhook-queue',
  DEAD_LETTER: 'dead-letter-queue',
};

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.WEBHOOK },
      { name: QUEUE_NAMES.DEAD_LETTER },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
