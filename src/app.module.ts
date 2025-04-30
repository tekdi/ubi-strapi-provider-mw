import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BenefitsModule } from './benefits/benefits.module';

@Module({
  imports: [ConfigModule.forRoot(), BenefitsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
