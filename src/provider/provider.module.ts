import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProviderService } from './provider.service';
import { GithubProvider } from './providers/github.provider';
import { StripeProvider } from './providers/stripe.provider';
import { MidtransProvider } from './providers/midtrans.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    ProviderService,
    GithubProvider,
    StripeProvider,
    MidtransProvider,
  ],
  exports: [ProviderService],
})
export class ProviderModule {}
