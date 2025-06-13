import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CsvExportEligibilityDto {
  @ApiProperty({
    description: 'Type of report (as per reports.json)',
    required: true,
    example: 'format1'
  })
  @IsString()
  @IsNotEmpty()
  type: string;
} 