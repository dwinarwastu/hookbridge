import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { IProvider } from '../provider.interface';

@Injectable()
export class StripeProvider implements IProvider {
  constructor(private readonly configService: ConfigService) {}

  validate(payload: Buffer, headers: Record<string, unknown>): boolean {
    const secret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    const signature = headers['stripe-signature'] as string;

    if (!signature || !secret) return false;

    const timestamp = signature.split(',')[0].split('=')[1];
    const receivedSig = signature.split(',')[1].split('=')[1];

    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac
      .update(`${timestamp}.${payload.toString()}`)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(receivedSig),
    );
  }

  extractEventType(payload: Record<string, unknown>): string {
    return (payload['type'] as string) ?? 'unknown';
  }
}
