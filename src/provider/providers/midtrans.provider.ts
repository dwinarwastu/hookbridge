import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { IProvider } from '../provider.interface';

@Injectable()
export class MidtransProvider implements IProvider {
  constructor(private readonly configService: ConfigService) {}

  validate(payload: Buffer, headers: Record<string, unknown>): boolean {
    if (process.env.NODE_ENV === 'development') return true;

    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
    const signatureKey = headers['x-signature-key'] as string;
    if (!signatureKey || !serverKey) return false;

    const body = JSON.parse(payload.toString()) as Record<string, unknown>;
    const orderId = body['order_id'] as string;
    const statusCode = body['status_code'] as string;
    const grossAmount = body['gross_amount'] as string;

    const hash = crypto
      .createHash('sha512')
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest('hex');

    return hash === signatureKey;
  }

  extractEventType(payload: Record<string, unknown>): string {
    return (payload['transaction_status'] as string) ?? 'unknown';
  }
}
