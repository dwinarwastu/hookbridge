import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StripeProvider } from './stripe.provider';

describe('StripeProvider', () => {
  let provider: StripeProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    provider = module.get<StripeProvider>(StripeProvider);
  });

  describe('validate', () => {
    it('should return true in development', () => {
      process.env.NODE_ENV = 'development';
      const result = provider.validate(Buffer.from('payload'), {});
      expect(result).toBe(true);
    });
  });

  describe('extractEventType', () => {
    it('should extract type from payload', () => {
      const result = provider.extractEventType({
        type: 'payment_intent.succeeded',
      });
      expect(result).toBe('payment_intent.succeeded');
    });

    it('should return unknown when type not present', () => {
      const result = provider.extractEventType({});
      expect(result).toBe('unknown');
    });
  });
});
