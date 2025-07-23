import { IsString, IsNotEmpty, IsArray, ValidateNested, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ContextDto } from './select-request.dto';

export class ImageDto {
  @ApiProperty({
    description: 'URL of the image',
    example: 'https://xyz.com/logo'
  })
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class DescriptorDto {
  @ApiProperty({
    description: 'Name of the descriptor',
    example: 'XYZ Education Foundation'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Short description',
    example: 'Short Description about the Foundation',
    required: false
  })
  @IsString()
  @IsOptional()
  short_desc?: string;

  @ApiProperty({
    description: 'Long description',
    example: 'XYZ Education Scholarship for Undergraduate Students',
    required: false
  })
  @IsString()
  @IsOptional()
  long_desc?: string;

  @ApiProperty({
    description: 'Code of the descriptor',
    example: 'background-eligibility',
    required: false
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'Images associated with the descriptor',
    type: [ImageDto],
    required: false
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  @IsOptional()
  images?: ImageDto[];
}

export class CityDto {
  @ApiProperty({
    description: 'Name of the city',
    example: 'Pune'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Code of the city',
    example: 'std:020'
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class StateDto {
  @ApiProperty({
    description: 'Name of the state',
    example: 'Maharastra'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Code of the state',
    example: 'MH'
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class LocationDto {
  @ApiProperty({
    description: 'Unique identifier for the location',
    example: 'L1'
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'City information',
    type: CityDto
  })
  @ValidateNested()
  @Type(() => CityDto)
  city: CityDto;

  @ApiProperty({
    description: 'State information',
    type: StateDto
  })
  @ValidateNested()
  @Type(() => StateDto)
  state: StateDto;
}

export class ProviderDto {
  @ApiProperty({
    description: 'Unique identifier for the provider',
    example: '471'
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Provider descriptor information',
    type: DescriptorDto
  })
  @ValidateNested()
  @Type(() => DescriptorDto)
  descriptor: DescriptorDto;

  @ApiProperty({
    description: 'Provider locations',
    type: [LocationDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  locations: LocationDto[];

  @ApiProperty({
    description: 'Whether the provider is rateable',
    example: false
  })
  @IsBoolean()
  rateable: boolean;
}

export class PriceDto {
  @ApiProperty({
    description: 'Currency of the price',
    example: 'INR'
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'Value of the price',
    example: '1000'
  })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class TimeRangeDto {
  @ApiProperty({
    description: 'Start time',
    example: '2023-01-03T13:23:01+00:00'
  })
  @IsString()
  @IsNotEmpty()
  start: string;

  @ApiProperty({
    description: 'End time',
    example: '2023-02-03T13:23:01+00:00'
  })
  @IsString()
  @IsNotEmpty()
  end: string;
}

export class TimeDto {
  @ApiProperty({
    description: 'Time range information',
    type: TimeRangeDto
  })
  @ValidateNested()
  @Type(() => TimeRangeDto)
  range: TimeRangeDto;
}

export class TagItemDto {
  @ApiProperty({
    description: 'Tag item descriptor',
    type: DescriptorDto
  })
  @ValidateNested()
  @Type(() => DescriptorDto)
  descriptor: DescriptorDto;

  @ApiProperty({
    description: 'Value of the tag item',
    example: 'SC'
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    description: 'Whether to display the tag item',
    example: true
  })
  @IsBoolean()
  display: boolean;
}

export class TagDto {
  @ApiProperty({
    description: 'Whether to display the tag',
    example: true
  })
  @IsBoolean()
  display: boolean;

  @ApiProperty({
    description: 'Tag descriptor',
    type: DescriptorDto
  })
  @ValidateNested()
  @Type(() => DescriptorDto)
  descriptor: DescriptorDto;

  @ApiProperty({
    description: 'List of tag items',
    type: [TagItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagItemDto)
  list: TagItemDto[];
}

export class OrderItemDto {
  @ApiProperty({
    description: 'Unique identifier for the order item',
    example: 'SCM_63587501'
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Item descriptor information',
    type: DescriptorDto
  })
  @ValidateNested()
  @Type(() => DescriptorDto)
  descriptor: DescriptorDto;

  @ApiProperty({
    description: 'Price information',
    type: PriceDto
  })
  @ValidateNested()
  @Type(() => PriceDto)
  price: PriceDto;

  @ApiProperty({
    description: 'Time information',
    type: TimeDto
  })
  @ValidateNested()
  @Type(() => TimeDto)
  time: TimeDto;

  @ApiProperty({
    description: 'Whether the item is rateable',
    example: false
  })
  @IsBoolean()
  rateable: boolean;

  @ApiProperty({
    description: 'Tags associated with the item',
    type: [TagDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  tags: TagDto[];

  @ApiProperty({
    description: 'Location IDs associated with the item',
    example: ['L1', 'L2']
  })
  @IsArray()
  @IsString({ each: true })
  location_ids: string[];

  @ApiProperty({
    description: 'Fulfillment IDs associated with the item',
    example: ['VSP_FUL_1113']
  })
  @IsArray()
  @IsString({ each: true })
  fulfillment_ids: string[];
}

export class FulfillmentDto {
  @ApiProperty({
    description: 'Unique identifier for the fulfillment',
    example: 'VSP_FUL_1113'
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Whether tracking is enabled',
    example: false
  })
  @IsBoolean()
  tracking: boolean;
}

export class BreakupItemDto {
  @ApiProperty({
    description: 'Title of the breakup item',
    example: 'Tution fee'
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Price information for the breakup item',
    type: PriceDto
  })
  @ValidateNested()
  @Type(() => PriceDto)
  price: PriceDto;
}

export class QuoteDto {
  @ApiProperty({
    description: 'Total price information',
    type: PriceDto
  })
  @ValidateNested()
  @Type(() => PriceDto)
  price: PriceDto;

  @ApiProperty({
    description: 'Price breakdown',
    type: [BreakupItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreakupItemDto)
  breakup: BreakupItemDto[];
}

export class OrderDto {
  @ApiProperty({
    description: 'Provider information',
    type: ProviderDto
  })
  @ValidateNested()
  @Type(() => ProviderDto)
  provider: ProviderDto;

  @ApiProperty({
    description: 'Array of order items',
    type: [OrderItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Fulfillment information',
    type: [FulfillmentDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FulfillmentDto)
  fulfillments: FulfillmentDto[];

  @ApiProperty({
    description: 'Quote information',
    type: QuoteDto
  })
  @ValidateNested()
  @Type(() => QuoteDto)
  quote: QuoteDto;
}

export class MessageDto {
  @ApiProperty({
    description: 'Order information',
    type: OrderDto
  })
  @ValidateNested()
  @Type(() => OrderDto)
  order: OrderDto;
}

export class SelectResponseDto {
  @ApiProperty({
    description: 'Context information for the response',
    type: ContextDto
  })
  @ValidateNested()
  @Type(() => ContextDto)
  context: ContextDto;

  @ApiProperty({
    description: 'Message content containing order details',
    type: MessageDto
  })
  @ValidateNested()
  @Type(() => MessageDto)
  message: MessageDto;
}
