import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString, IsNotEmpty } from 'class-validator';
// import { Type } from 'class-transformer';

export class ListApplicationsDto {
  // @ApiProperty({
  //   description: 'Page number (starts from 1)',
  //   required: false,
  //   default: 1,
  //   minimum: 1,
  //   example: 1
  // })
  // @Type(() => Number)
  // @IsInt()
  // @Min(1)
  // @IsOptional()
  // page?: number = 1;

  // @ApiProperty({
  //   description: 'Number of items per page',
  //   required: false,
  //   default: 10,
  //   minimum: 1,
  //   example: 10
  // })
  // @Type(() => Number)
  // @IsInt()
  // @Min(1)
  // @IsOptional()
  // limit?: number = 10;

  @ApiProperty({
    description: 'Filter by benefit ID',
    required: true,
    example: 'benefit-123'
  })
  @IsString()
  @IsNotEmpty()
  benefitId: string;
} 