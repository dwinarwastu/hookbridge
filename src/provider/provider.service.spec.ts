import { Test, TestingModule } from '@nestjs/testing';
import { ProviderService } from './provider.service';
import { GithubProvider } from './providers/github.provider';
import { StripeProvider } from './providers/stripe.provider';
import { MidtransProvider } from './providers/midtrans.provider';
import { ProviderEnum } from 'src/common/enums/provider.enum';
import { ConfigService } from '@nestjs/config';

describe('ProviderService', () => {
  let service: ProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderService,
        GithubProvider,
        StripeProvider,
        MidtransProvider,
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ProviderService>(ProviderService);
  });

  it('should return GithubProvider', () => {
    const provider = service.getProvider(ProviderEnum.GITHUB);
    expect(provider).toBeInstanceOf(GithubProvider);
  });

  it('should return StripeProvider', () => {
    const provider = service.getProvider(ProviderEnum.STRIPE);
    expect(provider).toBeInstanceOf(StripeProvider);
  });

  it('should return MidtransProvider', () => {
    const provider = service.getProvider(ProviderEnum.MIDTRANS);
    expect(provider).toBeInstanceOf(MidtransProvider);
  });
});
