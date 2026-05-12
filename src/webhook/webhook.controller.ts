import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { ProviderEnum } from 'src/common/enums/provider.enum';

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post(':provider')
  @ApiOperation({ summary: 'Receive webhook from third party provider' })
  async receive(
    @Param('provider') provider: ProviderEnum,
    @Req() req: Request,
    @Headers() headers: Record<string, unknown>,
  ): Promise<{ id: string; status: string }> {
    return this.webhookService.receive(provider, req.body as Buffer, headers);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Check webhook processing status' })
  async getStatus(@Param('id') id: string) {
    return this.webhookService.getStatus(id);
  }
}
