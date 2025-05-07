import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApplicationFilesService } from './applicationFiles.service';
import { ApplicationFilesController } from './applicationFiles.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ApplicationFilesController],
  imports: [HttpModule],
  providers: [ApplicationFilesService, ConfigService, PrismaService],
  exports: [ApplicationFilesService,],
})
export class ApplicationFilesModule { }
