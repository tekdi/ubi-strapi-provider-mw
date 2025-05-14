import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BenefitsService } from './benefits.service';
import { ConfigService } from '@nestjs/config';
import { BenefitsController } from './benefits.controller';
import { ApplicationsModule } from '../applications/applications.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [BenefitsController],
  imports: [HttpModule, forwardRef(() => ApplicationsModule)],
  providers: [BenefitsService, ConfigService, PrismaService],
  exports: [BenefitsService],
})
export class BenefitsModule {}
