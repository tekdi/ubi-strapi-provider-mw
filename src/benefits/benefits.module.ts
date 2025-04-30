import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BenefitsService } from './benefits.service';
import { ConfigService } from '@nestjs/config';
import { BenefitsController } from './benefits.controller';

@Module({
  controllers: [BenefitsController],
  imports: [HttpModule],
  providers: [BenefitsService, ConfigService],
  exports: [BenefitsService,],
})
export class BenefitsModule { }
