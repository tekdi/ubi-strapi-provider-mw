import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    enum: ApplicationStatus,
    description: 'New status for the application (approved or rejected)',
    example: ApplicationStatus.approved,
  })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
} 