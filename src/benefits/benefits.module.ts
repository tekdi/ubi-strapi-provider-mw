import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BenefitsService } from './benefits.service';
import { ConfigService } from '@nestjs/config';
import { BenefitsController } from './benefits.controller';
import { ApplicationsService } from 'src/applications/applications.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [BenefitsController],
  imports: [HttpModule],
  providers: [BenefitsService, ConfigService, ApplicationsService, PrismaService, PrismaService],
  exports: [BenefitsService],
})
export class BenefitsModule {}
