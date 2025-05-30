import { Module } from '@nestjs/common';
import { StrapiAdminController } from './strapi-admin.controller';
import { StrapiAdminService } from './strapi-admin.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [StrapiAdminController],
  imports: [HttpModule],
  providers: [StrapiAdminService, ConfigService, PrismaService]
})
export class StrapiAdminModule { }
