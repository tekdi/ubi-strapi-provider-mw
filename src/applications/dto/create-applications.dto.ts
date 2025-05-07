import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApplicationsDto {
  @ApiProperty({
    description: 'The unique benefit ID for the application',
    example: 'BENEFIT123',
  })
  @IsString()
  @IsNotEmpty()
  benefitId: string;

  @ApiProperty({
    description: 'The status of the application',
    example: 'Pending',
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: 'Additional application data in JSON format',
    example: { key: 'value' },
  })
  @IsObject()
  applicationData: Record<string, any>;

  @ApiPropertyOptional({ description: 'Customer ID', example: 'CUST123' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'BAP ID', example: 'BAP456' })
  @IsOptional()
  @IsString()
  bapId?: string;

  @ApiPropertyOptional({ description: 'Calculated Amount', example: '1000.00' })
  @IsOptional()
  @IsString()
  calculatedAmount?: string;

  @ApiPropertyOptional({ description: 'Final Amount', example: '1200.00' })
  @IsOptional()
  @IsString()
  finalAmount?: string;
}
