import { Module } from '@nestjs/common';
import { StrapiAdminController } from './strapi-admin.controller';
import { StrapiAdminService } from './strapi-admin.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [StrapiAdminController],
  imports: [HttpModule],
  providers: [StrapiAdminService, ConfigService]
})
export class StrapiAdminModule {}
