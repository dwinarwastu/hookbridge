import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ProviderEnum } from 'src/common/enums/provider.enum';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'order-service' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ProviderEnum, example: ProviderEnum.STRIPE })
  @IsEnum(ProviderEnum)
  provider: ProviderEnum;

  @ApiProperty({ example: 'payment.success' })
  @IsString()
  eventType: string;

  @ApiProperty({ example: 'order-queue' })
  @IsString()
  targetQueue: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
