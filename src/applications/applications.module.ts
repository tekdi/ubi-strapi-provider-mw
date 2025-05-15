import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { PrismaService } from '../prisma.service';
import { BenefitsModule } from 'src/benefits/benefits.module';

@Module({
  controllers: [ApplicationsController],
  imports: [HttpModule, forwardRef(() => BenefitsModule)],
  providers: [ApplicationsService, ConfigService, PrismaService],
  exports: [ApplicationsService],
})
export class ApplicationsModule { }
