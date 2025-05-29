import { Module } from '@nestjs/common';
import { StrapiAdminController } from './strapi-admin.controller';
import { StrapiAdminService } from './strapi-admin.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [StrapiAdminController],
  imports: [HttpModule],
  providers: [StrapiAdminService, ConfigService, AuthService, PrismaService]
})
export class StrapiAdminModule { }
