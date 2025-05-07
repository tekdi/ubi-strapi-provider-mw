import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    description: 'New status for the application',
    example: 'approved',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  status: string;
} 