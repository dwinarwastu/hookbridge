import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProviderEnum } from '../enums/provider.enum';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ProviderEnum })
  provider: ProviderEnum;

  @Column()
  eventType: string;

  @Column()
  targetQueue: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
