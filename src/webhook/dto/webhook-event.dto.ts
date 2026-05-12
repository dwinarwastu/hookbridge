import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ProviderEnum } from 'src/common/enums/provider.enum';

export class WebhookEventDto {
  @ApiProperty({ enum: ProviderEnum, example: ProviderEnum.STRIPE })
  @IsEnum(ProviderEnum)
  provider: ProviderEnum;
}
