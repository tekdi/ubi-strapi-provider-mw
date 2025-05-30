import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyApplicationVcsRequestDto {
  @ApiProperty({
    description: 'The application ID to verify',
    example: '1', // Ensure the example is set here
  })
  @IsNotEmpty({ message: 'Application ID is required' })
  @IsString({ message: 'Application ID must be a string' })
  applicationId: string;

  @ApiPropertyOptional({
    description: 'Array of application file IDs to verify (optional)',
    example: ['13', '14'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicationFileIds?: string[];
}
