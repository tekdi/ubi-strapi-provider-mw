import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthMiddleware } from './common/middlewares/auth.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BenefitsModule } from './benefits/benefits.module';
import { ApplicationFilesModule } from './applicationFiles/applicationFiles.module';
import { ApplicationsModule } from './applications/applications.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { VerificationsModule } from './verifications/verifications.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ApplicationStatusUpdate } from './applications/crons/calculate-benefit-amount';
import { S3Service } from './services/cloud-service/s3.service';
import { LocalStorageService } from './services/cloud-service/local-storage.service';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    BenefitsModule,
    ApplicationFilesModule,
    ApplicationsModule,
    AuthModule,
    VerificationsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    ApplicationStatusUpdate,
    {
      provide: 'FileStorageService',
      useClass: process.env.FILE_STORAGE_PROVIDER === 's3' ? S3Service : LocalStorageService,
    },
    S3Service,
    LocalStorageService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '/*', method: RequestMethod.ALL });
  }
}
