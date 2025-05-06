import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateApplicationsDto {
  @ApiPropertyOptional({
    description: 'The unique benefit ID for the application',
    example: 'BENEFIT123',
  })
  @IsString()
  @IsOptional()
  benefitId?: string;

  @ApiPropertyOptional({
    description: 'The status of the application',
    example: 'Approved',
  })
  @IsString()
  @IsOptional()
  status?: string;
}