import { IsArray, IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DescriptorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  short_desc?: string;

  @IsOptional()
  @IsArray()
  images?: { url: string }[];
}

class LocationDto {
  @IsString()
  id: string;

  @IsObject()
  city: {
    name: string;
    code: string;
  };

  @IsObject()
  state: {
    name: string;
    code: string;
  };
}

class ItemDto {
  @IsString()
  id: string;

  @IsObject()
  descriptor: {
    name: string;
    long_desc: string;
  };

  @IsObject()
  price: {
    currency: string;
    value: string;
  };

  @IsObject()
  time: {
    range: {
      start: string;
      end: string;
    };
  };

  @IsBoolean()
  rateable: boolean;

  @IsOptional()
  @IsArray()
  tags?: any[];

  @IsOptional()
  @IsArray()
  location_ids?: string[];

  @IsOptional()
  @IsArray()
  fulfillment_ids?: string[];
}

class ProviderDto {
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => DescriptorDto)
  descriptor: DescriptorDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  locations: LocationDto[];

  @IsBoolean()
  rateable: boolean;
}

class OrderDto {
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => ProviderDto)
  provider: ProviderDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  @IsOptional()
  @IsObject()
  billing?: any;

  @IsOptional()
  @IsArray()
  fulfillments?: any[];

  @IsOptional()
  @IsArray()
  payments?: any[];

  @IsOptional()
  @IsObject()
  quote?: any;
}

class ContextDto {
  @IsString()
  domain: string;

  @IsString()
  action: string;

  @IsString()
  timestamp: string;

  @IsString()
  ttl: string;

  @IsString()
  version: string;

  @IsString()
  bap_id: string;

  @IsString()
  bap_uri: string;

  @IsString()
  bpp_id: string;

  @IsString()
  bpp_uri: string;

  @IsString()
  transaction_id: string;

  @IsString()
  message_id: string;
}

export class ConfirmResponseDto {
  @ValidateNested()
  @Type(() => ContextDto)
  context: ContextDto;

  @ValidateNested()
  @Type(() => OrderDto)
  message: {
    order: OrderDto;
  };
}