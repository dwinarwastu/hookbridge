import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { GithubProvider } from './github.provider';

describe('GithubProvider', () => {
  let provider: GithubProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    provider = module.get<GithubProvider>(GithubProvider);
  });

  describe('validate', () => {
    it('should return true in development', () => {
      process.env.NODE_ENV = 'development';
      const result = provider.validate(Buffer.from('payload'), {});
      expect(result).toBe(true);
    });

    it('should return true for valid signature', () => {
      process.env.NODE_ENV = 'production';
      const payload = Buffer.from('{"action":"push"}');
      const secret = 'test-secret';
      const hmac = crypto.createHmac('sha256', secret);
      const signature = `sha256=${hmac.update(payload).digest('hex')}`;

      const result = provider.validate(payload, {
        'x-hub-signature-256': signature,
      });
      expect(result).toBe(true);
    });

    it('should return false for invalid signature', () => {
      process.env.NODE_ENV = 'production';
      const payload = Buffer.from('{"action":"push"}');
      const fakeSignature = `sha256=${'0'.repeat(64)}`;
      const result = provider.validate(payload, {
        'x-hub-signature-256': fakeSignature,
      });
      expect(result).toBe(false);
    });
  });

  describe('extractEventType', () => {
    it('should extract action from payload', () => {
      const result = provider.extractEventType({ action: 'push' });
      expect(result).toBe('push');
    });

    it('should return unknown when action not present', () => {
      const result = provider.extractEventType({});
      expect(result).toBe('unknown');
    });
  });
});
