import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { IProvider } from '../provider.interface';

@Injectable()
export class GithubProvider implements IProvider {
  constructor(private readonly configService: ConfigService) {}

  validate(payload: Buffer, headers: Record<string, unknown>): boolean {
    const secret = this.configService.get<string>('GITHUB_WEBHOOK_SECRET');
    const signature = headers['x-hub-signature-256'] as string;

    if (!signature || !secret) return false;

    const hmac = crypto.createHmac('sha256', secret);
    const digest = `sha256=${hmac.update(payload).digest('hex')}`;

    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  }

  extractEventType(payload: Record<string, unknown>): string {
    return (payload['action'] as string) ?? 'unknown';
  }
}
