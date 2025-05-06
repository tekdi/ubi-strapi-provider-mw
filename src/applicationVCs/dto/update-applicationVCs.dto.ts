import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateApplicationVCsDto {
  @ApiPropertyOptional({
    description: 'The ID of the application file',
    example: 'FILE123',
  })
  @IsString()
  @IsOptional()
  applicationFilesId?: string;

  @ApiPropertyOptional({
    description: 'The ID of the related application',
    example: 1,
  })
  @IsOptional()
  applicationId?: number;
}