import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BenefitsModule } from './benefits/benefits.module';
import { ApplicationFilesModule } from './applicationFiles/applicationFiles.module';
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [ConfigModule.forRoot(), BenefitsModule, ApplicationFilesModule, ApplicationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
