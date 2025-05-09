import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';

@Module({
  providers: [VerificationService],
  exports: [VerificationService], // Export the service for use in other modules
})
export class VerificationsModule {}
