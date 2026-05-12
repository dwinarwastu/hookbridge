import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProviderEnum } from '../enums/provider.enum';
import { WebhookStatus } from '../enums/webhook-status.enum';

@Entity('webhook_logs')
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ProviderEnum })
  provider: ProviderEnum;

  @Column({
    type: 'enum',
    enum: WebhookStatus,
    default: WebhookStatus.RECEIVED,
  })
  status: WebhookStatus;

  @Column()
  eventType: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  headers: Record<string, unknown>;

  @Column({ default: 0 })
  attemptCount: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
