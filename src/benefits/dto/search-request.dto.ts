import { ApiProperty } from '@nestjs/swagger';
import { BENEFIT_CONSTANTS } from '../benefit.constants';

class LocationDto {
  @ApiProperty({ example: { name: 'India', code: 'IND' } })
  country: { name: string; code: string };

  @ApiProperty({ example: { name: 'Bangalore', code: 'std:080' } })
  city: { name: string; code: string };
}

class ContextDto {
  @ApiProperty({ example: BENEFIT_CONSTANTS.FINANCE })
  domain: string;

  @ApiProperty({ example: 'search' })
  action: string;

  @ApiProperty({ example: '1.1.0' })
  version: string;

  @ApiProperty({ example: 'dev-uba-bap.host.com' })
  bap_id: string;

  @ApiProperty({ example: 'https://dev-uba-bap.host.com/' })
  bap_uri: string;

  @ApiProperty({ example: 'dev-uba-bpp.host.com' })
  bpp_id: string;

  @ApiProperty({ example: 'https://dev-uba-bpp.host.com/' })
  bpp_uri: string;

  @ApiProperty({ example: 'a9aaecca-10b7-4d19-b640-b047a7c60008' })
  transaction_id: string;

  @ApiProperty({ example: 'a9aaecca-10b7-4d19-b640-b047a7c60009' })
  message_id: string;

  @ApiProperty({ example: '2023-02-06T09:55:41.161Z' })
  timestamp: string;

  @ApiProperty({ type: LocationDto })
  location: LocationDto;
}

class IntentDto {
  @ApiProperty({ example: { descriptor: {} } })
  item: { descriptor: Record<string, any> };
}

class MessageDto {
  @ApiProperty({ type: IntentDto })
  intent: IntentDto;
}

export class SearchRequestDto {
  @ApiProperty({ type: ContextDto })
  context: ContextDto;

  @ApiProperty({ type: MessageDto })
  message: MessageDto;
}
