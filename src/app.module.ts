import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthMiddleware } from './common/middlewares/auth.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BenefitsModule } from './benefits/benefits.module';
import { ApplicationFilesModule } from './applicationFiles/applicationFiles.module';
import { ApplicationsModule } from './applications/applications.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BenefitsModule,
    ApplicationFilesModule,
    ApplicationsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '/*', method: RequestMethod.ALL });
  }
}
