import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyApplicationVcsRequestDto {
  @ApiProperty({ description: 'The ID of the application to verify' })
  @IsString()
  applicationId: string;
}
