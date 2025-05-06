import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApplicationVCsService } from './applicationVCs.service';
import { ApplicationVCsController } from './applicationVCs.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ApplicationVCsController],
  imports: [HttpModule],
  providers: [ApplicationVCsService, ConfigService, PrismaService],
  exports: [ApplicationVCsService,],
})
export class ApplicationVCsModule { }
