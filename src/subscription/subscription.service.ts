import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from 'src/common/entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ProviderEnum } from 'src/common/enums/provider.enum';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(dto: CreateSubscriptionDto): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create({
      ...dto,
      isActive: dto.isActive ?? true,
    });
    return this.subscriptionRepository.save(subscription);
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find();
  }

  async findByProviderAndEvent(
    provider: string,
    eventType: string,
  ): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { provider: provider as ProviderEnum, eventType, isActive: true },
    });
  }

  async remove(id: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');
    await this.subscriptionRepository.remove(subscription);
  }

  async toggleActive(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');
    subscription.isActive = !subscription.isActive;
    return this.subscriptionRepository.save(subscription);
  }
}
