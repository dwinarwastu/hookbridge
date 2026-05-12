import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { WebhookModule } from './webhook/webhook.module';
import { QueueModule } from './queue/queue.module';
import { ProviderModule } from './provider/provider.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { WorkersModule } from './workers/workers.module';
import { WebhookLog } from './common/entities/webhook-log.entity';
import { Subscription } from './common/entities/subscription.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        entities: [WebhookLog, Subscription],
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
      }),
    }),
    WebhookModule,
    QueueModule,
    ProviderModule,
    SubscriptionModule,
    WorkersModule,
  ],
})
export class AppModule {}
