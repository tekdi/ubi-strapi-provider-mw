import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { VerificationService } from './verification.service';
import { PrismaService } from '../prisma.service';
import { VerificationController } from './verifications.controller';

@Module({
  imports: [HttpModule],
  controllers: [VerificationController], // Add the new controller
  providers: [VerificationService, PrismaService],
  exports: [VerificationService],
})
export class VerificationsModule {}
