import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { PrismaService } from '../prisma.service';
import { VerificationsController } from './verifications.controller';

@Module({
  controllers: [VerificationsController], // Add the new controller
  providers: [VerificationService, PrismaService],
  exports: [VerificationService],
})
export class VerificationsModule {}
