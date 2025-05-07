import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ApplicationsController],
  imports: [HttpModule],
  providers: [ApplicationsService, ConfigService, PrismaService],
  exports: [ApplicationsService,],
})
export class ApplicationsModule { }
