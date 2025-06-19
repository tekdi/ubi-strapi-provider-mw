import { Module, forwardRef } from '@nestjs/common';
import { AclService } from './acl';
import { PrismaService } from '../../prisma.service';
import { BenefitsModule } from '../../benefits/benefits.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    forwardRef(() => BenefitsModule),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule
  ],
  providers: [AclService, PrismaService],
  exports: [AclService],
})
export class AclModule {} 