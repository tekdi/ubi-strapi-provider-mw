import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationVCsDto {
  @ApiProperty({
    description: 'The ID of the application file',
    example: 'FILE123',
  })
  @IsString()
  @IsNotEmpty()
  applicationFilesId: string;

  @ApiProperty({
    description: 'The ID of the related application',
    example: 1,
  })
  @IsNotEmpty()
  applicationId: number;
}