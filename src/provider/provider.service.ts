import { Injectable } from '@nestjs/common';
import { ProviderEnum } from 'src/common/enums/provider.enum';
import { IProvider } from './provider.interface';
import { GithubProvider } from './providers/github.provider';
import { StripeProvider } from './providers/stripe.provider';
import { MidtransProvider } from './providers/midtrans.provider';

@Injectable()
export class ProviderService {
  private readonly providerMap: Record<ProviderEnum, IProvider>;

  constructor(
    private readonly githubProvider: GithubProvider,
    private readonly stripeProvider: StripeProvider,
    private readonly midtransProvider: MidtransProvider,
  ) {
    this.providerMap = {
      [ProviderEnum.GITHUB]: this.githubProvider,
      [ProviderEnum.STRIPE]: this.stripeProvider,
      [ProviderEnum.MIDTRANS]: this.midtransProvider,
    };
  }

  getProvider(provider: ProviderEnum): IProvider {
    return this.providerMap[provider];
  }
}
