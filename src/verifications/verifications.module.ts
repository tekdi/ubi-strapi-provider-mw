import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { VerificationService } from './verification.service';
import { PrismaService } from '../prisma.service';
import { VerificationController } from './verifications.controller';
import { S3Service } from '../services/cloud-service/s3.service';
import { LocalStorageService } from '../services/cloud-service/local-storage.service';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => ApplicationsModule),
  ],
  controllers: [VerificationController],
  providers: [
    VerificationService,
    PrismaService,
    S3Service,
    LocalStorageService,
    {
      provide: 'FileStorageService',
      useClass: process.env.FILE_STORAGE_PROVIDER === 's3' ? S3Service : LocalStorageService,
    },
  ],
  exports: [VerificationService, 'FileStorageService'],
})
export class VerificationsModule {}
