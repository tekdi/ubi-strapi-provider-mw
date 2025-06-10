import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { PrismaService } from '../prisma.service';
import { BenefitsModule } from 'src/benefits/benefits.module';
import { S3Service } from '../services/cloud-service/s3.service';
import { LocalStorageService } from '../services/cloud-service/local-storage.service';

@Module({
  controllers: [ApplicationsController],
  imports: [HttpModule, forwardRef(() => BenefitsModule)],
  providers: [
    ApplicationsService,
    ConfigService,
    PrismaService,
    S3Service,
    LocalStorageService,
    {
      provide: 'FileStorageService',
      useClass: process.env.FILE_STORAGE_PROVIDER === 's3' ? S3Service : LocalStorageService,
    },
  ],
  exports: [ApplicationsService, 'FileStorageService'],
})
export class ApplicationsModule { }
