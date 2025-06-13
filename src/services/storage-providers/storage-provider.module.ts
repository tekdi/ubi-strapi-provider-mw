import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3StorageAdapter } from './adapters/s3.storage.adapter';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';

@Module({
  imports: [ConfigModule],
  providers: [
    S3StorageAdapter,
    LocalStorageAdapter,
    {
      provide: 'FileStorageService',
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('FILE_STORAGE_PROVIDER');
        if (provider === 's3') {
          return new S3StorageAdapter();
        }
        return new LocalStorageAdapter();
      },
      inject: [ConfigService],
    },
  ],
  exports: ['FileStorageService'],
})
export class StorageProviderModule {}
