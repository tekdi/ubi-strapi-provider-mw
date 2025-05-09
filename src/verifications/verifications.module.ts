import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { VerificationService } from './verification.service';
import { PrismaService } from '../prisma.service';
import { VerificationsController } from './verifications.controller';

@Module({
  imports: [HttpModule],
  controllers: [VerificationsController], // Add the new controller
  providers: [VerificationService, PrismaService],
  exports: [VerificationService],
})
export class VerificationsModule {}
