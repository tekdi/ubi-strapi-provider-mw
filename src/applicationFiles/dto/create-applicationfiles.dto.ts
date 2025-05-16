import { IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationFilesDto {
  
  @ApiProperty({
    description: 'The ID of the related application',
    example: 1,
  })
  @IsNotEmpty()
  applicationId: number;

  @ApiProperty({
    description: 'Additional application data in JSON format',
    example: { key: 'value' },
  })
  @IsObject()
  verificationStatus? : Record<string, any>;
}