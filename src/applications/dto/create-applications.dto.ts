import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}