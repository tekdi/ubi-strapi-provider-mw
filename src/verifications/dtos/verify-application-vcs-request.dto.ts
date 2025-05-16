import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyApplicationVcsRequestDto {
  @ApiProperty({
    description: 'The application ID to verify',
    example: '1', // Ensure the example is set here
  })
  @IsNotEmpty({ message: 'Application ID is required' })
  @IsString({ message: 'Application ID must be a string' })
  applicationId: string;
}
