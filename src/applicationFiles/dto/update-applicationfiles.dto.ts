import { IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateApplicationFilesDto {

  @ApiPropertyOptional({
    description: 'The ID of the related application',
    example: 1,
  })
  @IsOptional()
  applicationId?: number;

  @ApiPropertyOptional({
    description: 'Additional application data in JSON format',
    example: { key: 'value' },
  })
  @IsObject()
  verificationStatus?: Record<string, any>;
}