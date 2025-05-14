import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress'
}

export class UpdateApplicationStatusDto {
  @ApiProperty({
    description: 'New status for the application',
    example: 'approved',
    required: true,
    enum: ApplicationStatus,
    enumName: 'ApplicationStatus'
  })
  @IsEnum(ApplicationStatus, {
    message: `Status must be one of: ${Object.values(ApplicationStatus).join(', ')}`
  })
  status: ApplicationStatus;

  @ApiProperty({
    description: 'Remark for the status change',
    example: 'Application approved successfully',
    required: true
  })
  remark: string;
} 