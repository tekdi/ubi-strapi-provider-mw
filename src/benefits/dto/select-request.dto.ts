import { IsString, IsNotEmpty, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BENEFIT_CONSTANTS } from '../benefit.constants';

export class ContextDto {
  @ApiProperty({
    description: 'Domain of the request',
    example: 'onest:financial-support'
  })
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiProperty({
    description: 'Action to be performed',
    example: 'select'
  })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({
    description: 'Timestamp of the request',
    example: '2023-08-02T07:21:58.448Z'
  })
  @IsDateString()
  @IsNotEmpty()
  timestamp: string;

  @ApiProperty({
    description: 'Time to live for the request',
    example: 'PT10M'
  })
  @IsString()
  @IsNotEmpty()
  ttl: string;

  @ApiProperty({
    description: 'Version of the API',
    example: '1.1.0'
  })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({
    description: 'Buyer App Platform ID',
    example: 'sample.bap.io'
  })
  @IsString()
  @IsNotEmpty()
  bap_id: string;

  @ApiProperty({
    description: 'Buyer App Platform URI',
    example: 'https://sample.bap.io'
  })
  @IsString()
  @IsNotEmpty()
  bap_uri: string;

  @ApiProperty({
    description: 'Buyer App Provider Platform ID',
    example: 'sample.bpp.io'
  })
  @IsString()
  @IsNotEmpty()
  bpp_id: string;

  @ApiProperty({
    description: 'Buyer App Provider Platform URI',
    example: 'https://sample.bpp.io'
  })
  @IsString()
  @IsNotEmpty()
  bpp_uri: string;

  @ApiProperty({
    description: 'Unique transaction ID',
    example: 'a9aaecca-10b7-4d19-b640-b047a7c60008'
  })
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @ApiProperty({
    description: 'Unique message ID',
    example: 'f6a7d7ea-a23e-4419-b07e-a3412fdffecf'
  })
  @IsString()
  @IsNotEmpty()
  message_id: string;
}

export class OrderItemDto {
  @ApiProperty({
    description: 'Unique identifier for the order item',
    example: 'SCM_63587501'
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class ProviderDto {
  @ApiProperty({
    description: 'Unique identifier for the provider',
    example: 'BX213573733'
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class OrderDto {
  @ApiProperty({
    description: 'Array of order items',
    type: [OrderItemDto],
    example: [{ id: 'SCM_63587501' }]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Provider information',
    type: ProviderDto,
    example: { id: 'BX213573733' }
  })
  @ValidateNested()
  @Type(() => ProviderDto)
  provider: ProviderDto;
}

export class MessageDto {
  @ApiProperty({
    description: 'Order information',
    type: OrderDto,
    example: {
      items: [{ id: 'SCM_63587501' }],
      provider: { id: 'BX213573733' }
    }
  })
  @ValidateNested()
  @Type(() => OrderDto)
  order: OrderDto;
}

export class SelectRequestDto {
  @ApiProperty({
    description: 'Context information for the request',
    type: ContextDto,
    example: {
      domain: BENEFIT_CONSTANTS.FINANCE,
      action: 'select',
      timestamp: '2023-08-02T07:21:58.448Z',
      ttl: 'PT10M',
      version: '1.1.0',
      bap_id: 'sample.bap.io',
      bap_uri: 'https://sample.bap.io',
      bpp_id: 'sample.bpp.io',
      bpp_uri: 'https://sample.bpp.io',
      transaction_id: 'a9aaecca-10b7-4d19-b640-b047a7c60008',
      message_id: 'f6a7d7ea-a23e-4419-b07e-a3412fdffecf'
    }
  })
  @ValidateNested()
  @Type(() => ContextDto)
  context: ContextDto;

  @ApiProperty({
    description: 'Message content containing order details',
    type: MessageDto,
    example: {
      order: {
        items: [{ id: 'SCM_63587501' }],
        provider: { id: 'BX213573733' }
      }
    }
  })
  @ValidateNested()
  @Type(() => MessageDto)
  message: MessageDto;
}
