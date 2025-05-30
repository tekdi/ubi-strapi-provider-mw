import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StrapiAdminProviderDto {
  // Provider are roles in Strapi

  @ApiProperty({description: 'Name of the Provider',})
  @IsString()
  name: string;

  @ApiProperty({description: 'Description of the Provider',})
  @IsString()
  description: string;
}