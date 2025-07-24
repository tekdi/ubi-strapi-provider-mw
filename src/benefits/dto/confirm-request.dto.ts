import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BENEFIT_CONSTANTS } from '../benefit.constants';

class LocationDto {
  @ApiProperty({ description: 'City details', example: { name: 'Bangalore', code: 'std:080' } })
  @IsNotEmpty()
  city: { name: string; code: string };

  @ApiProperty({ description: 'Country details', example: { name: 'India', code: 'IND' } })
  @IsNotEmpty()
  country: { name: string; code: string };
}

class ConfirmContextDto {
  @ApiProperty({ description: 'Domain of the request', example: BENEFIT_CONSTANTS.FINANCE })
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiProperty({ description: 'Location details', type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ description: 'Action to be performed', example: 'confirm' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ description: 'Timestamp of the request', example: '2023-08-02T07:21:58.448Z' })
  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @ApiProperty({ description: 'Time-to-live for the request', example: 'PT10M' })
  @IsString()
  @IsNotEmpty()
  ttl: string;

  @ApiProperty({ description: 'Version of the API', example: '1.1.0' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ description: 'BAP ID', example: 'sample.bap.io' })
  @IsString()
  @IsNotEmpty()
  bap_id: string;

  @ApiProperty({ description: 'BAP URI', example: 'https://sample.bap.io' })
  @IsString()
  @IsNotEmpty()
  bap_uri: string;

  @ApiProperty({ description: 'BPP ID', example: 'sample.bpp.io' })
  @IsString()
  @IsNotEmpty()
  bpp_id: string;

  @ApiProperty({ description: 'BPP URI', example: 'https://sample.bpp.io' })
  @IsString()
  @IsNotEmpty()
  bpp_uri: string;

  @ApiProperty({ description: 'Transaction ID', example: 'a9aaecca-10b7-4d19-b640-b047a7c60008' })
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @ApiProperty({ description: 'Message ID', example: 'f6a7d7ea-a23e-4419-b07e-a3412fdffecf' })
  @IsString()
  @IsNotEmpty()
  message_id: string;
}

class ConfirmItemDto {
  @ApiProperty({ description: 'Item ID', example: 'SCM_63587501' })
  @IsString()
  @IsNotEmpty()
  id: string;
}

class BillingDto {
  @ApiProperty({ description: 'Billing name', example: 'Manjunath' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Organization details', type: Object })
  @IsNotEmpty()
  organization: {
    descriptor: { name: string; code: string };
    contact: { phone: string; email: string };
  };

  @ApiProperty({ description: 'Billing address', example: 'No 27, XYZ Lane, etc' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'Billing phone', example: '+91-9999999999' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

class FulfillmentTagDto {
  @ApiProperty({ description: 'Tag descriptor', type: Object })
  @IsNotEmpty()
  descriptor: { code: string; name: string };

  @ApiProperty({ description: 'Tag value', example: 'PNB' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

class FulfillmentDto {
  @ApiProperty({ description: 'Customer details', type: Object })
  @IsNotEmpty()
  customer: {
    id: string;
    person: { name: string; age: string; gender: string };
    contact: { phone: string; email: string };
  };

  @ApiProperty({ description: 'Fulfillment tags', type: [FulfillmentTagDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FulfillmentTagDto)
  tags: FulfillmentTagDto[];
}

class PaymentDto {
  @ApiProperty({ description: 'Payment parameters', type: Object })
  @IsNotEmpty()
  params: {
    bank_code: string;
    bank_account_number: string;
    bank_account_name: string;
  };
}

class ConfirmOrderDto {
  @ApiProperty({ description: 'List of items in the order', type: [ConfirmItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmItemDto)
  items: ConfirmItemDto[];

  @ApiProperty({ description: 'Provider details', type: Object })
  @IsNotEmpty()
  provider: { id: string };

  @ApiProperty({ description: 'Billing details', type: BillingDto })
  @ValidateNested()
  @Type(() => BillingDto)
  billing: BillingDto;

  @ApiProperty({ description: 'Fulfillment details', type: [FulfillmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FulfillmentDto)
  fulfillments: FulfillmentDto[];

  @ApiProperty({ description: 'Payment details', type: [PaymentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDto)
  payment: PaymentDto[];
}

class ConfirmMessageDto {
  @ApiProperty({ description: 'Order details', type: ConfirmOrderDto })
  @ValidateNested()
  @Type(() => ConfirmOrderDto)
  order: ConfirmOrderDto;
}

export class ConfirmRequestDto {
  @ApiProperty({ description: 'Context of the request', type: ConfirmContextDto })
  @ValidateNested()
  @Type(() => ConfirmContextDto)
  context: ConfirmContextDto;

  @ApiProperty({ description: 'Message containing the order details', type: ConfirmMessageDto })
  @ValidateNested()
  @Type(() => ConfirmMessageDto)
  message: ConfirmMessageDto;
}