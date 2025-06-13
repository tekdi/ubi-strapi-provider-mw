import { Module, forwardRef } from '@nestjs/common';
import { AclService } from './acl';
import { PrismaService } from '../../prisma.service';
import { BenefitsModule } from '../../benefits/benefits.module';

@Module({
  imports: [
    forwardRef(() => BenefitsModule)
  ],
  providers: [AclService, PrismaService],
  exports: [AclService],
})
export class AclModule {} 