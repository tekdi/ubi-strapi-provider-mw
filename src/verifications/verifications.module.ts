import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { VerificationService } from './verification.service';
import { PrismaService } from '../prisma.service';
import { VerificationController } from './verifications.controller';
import { ApplicationsModule } from '../applications/applications.module';
import { StorageProviderModule } from '../services/storage-providers/storage-provider.module';

@Module({
  imports: [
    HttpModule,
    StorageProviderModule,
    forwardRef(() => ApplicationsModule),
  ],
  controllers: [VerificationController],
  providers: [
    VerificationService,
    PrismaService,
  ],
  exports: [VerificationService],
})
export class VerificationsModule {}
