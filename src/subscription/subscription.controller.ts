import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Subscription } from 'src/common/entities/subscription.entity';

@ApiTags('subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new subscription' })
  async create(@Body() dto: CreateSubscriptionDto): Promise<Subscription> {
    return this.subscriptionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all subscriptions' })
  async findAll(): Promise<Subscription[]> {
    return this.subscriptionService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a subscription' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.subscriptionService.remove(id);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle subscription active status' })
  async toggleActive(@Param('id') id: string): Promise<Subscription> {
    return this.subscriptionService.toggleActive(id);
  }
}
