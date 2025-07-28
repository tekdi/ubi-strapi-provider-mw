import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString, IsNotEmpty } from 'class-validator';

export class ListApplicationsDto {

  @ApiProperty({
    description: 'Filter by benefit ID',
    required: true,
    example: 'benefit-123'
  })
  @IsString()
  @IsNotEmpty()
  benefitId: string;

	@ApiProperty({
		description: 'sorting order ASC/DESC',
		required: false,
		example: 'DESC',
	})
	@IsString()
	@IsOptional()
		sortOrder?: string;

	@ApiProperty({
		description: 'sort by application id',
		required: false,
		example: 'id',
	})
	@IsString()
	@IsOptional()
		sortBy: string;
} 