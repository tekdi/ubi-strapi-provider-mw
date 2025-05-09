import { ApiProperty } from '@nestjs/swagger';

export class VerifyApplicationVcsResponseDto {
  @ApiProperty({ description: 'The ID of the application' })
  applicationId: string;

  @ApiProperty({ description: 'Verification status', enum: ['verified', 'unverified'] })
  status: 'verified' | 'unverified';

  @ApiProperty({ description: 'List of verified credentials', type: [String] })
  verifiedCredentials: string[];

  @ApiProperty({ description: 'Additional message about the verification result' })
  message: string;
}
