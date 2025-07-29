import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BENEFIT_CONSTANTS } from '../benefit.constants';

class StatusContextDto {
  @ApiProperty({ description: 'Domain of the request', example: BENEFIT_CONSTANTS.FINANCE })
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiProperty({ description: 'Action to be performed', example: 'status' })
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

  @ApiProperty({ description: 'BAP ID', example: 'dev-uba-bap.tekdinext.com' })
  @IsString()
  @IsNotEmpty()
  bap_id: string;

  @ApiProperty({ description: 'BAP URI', example: 'https://dev-uba-bap.tekdinext.com/' })
  @IsString()
  @IsNotEmpty()
  bap_uri: string;

  @ApiProperty({ description: 'BPP ID', example: 'dev-uba-bpp.tekdinext.com' })
  @IsString()
  @IsNotEmpty()
  bpp_id: string;

  @ApiProperty({ description: 'BPP URI', example: 'https://dev-uba-bpp.tekdinext.com/' })
  @IsString()
  @IsNotEmpty()
  bpp_uri: string;

  @ApiProperty({ description: 'Transaction ID', example: '184b4e46-463f-42b1-b1be-c4c8aa42bdcd' })
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @ApiProperty({ description: 'Message ID', example: 'c444c96f-a2d8-48ea-b7a1-f6787f207a55' })
  @IsString()
  @IsNotEmpty()
  message_id: string;
}

class StatusMessageDto {
  @ApiProperty({ description: 'Order ID', example: '2413bdc3-a863-417b-adfc-1137816e2d51' })
  @IsString()
  @IsNotEmpty()
  order_id: string;
}

export class StatusRequestDto {
  @ApiProperty({ description: 'Context of the request', type: StatusContextDto })
  @ValidateNested()
  @Type(() => StatusContextDto)
  context: StatusContextDto;

  @ApiProperty({ description: 'Message containing the order ID', type: StatusMessageDto })
  @ValidateNested()
  @Type(() => StatusMessageDto)
  message: StatusMessageDto;
}