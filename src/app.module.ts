import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BenefitsModule } from './benefits/benefits.module';
import { ApplicationVCsModule } from './applicationVCs/applicationsVCs.module';
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [ConfigModule.forRoot(), BenefitsModule, ApplicationVCsModule, ApplicationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
