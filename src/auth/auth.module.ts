import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AuthController],
  imports: [HttpModule],
  providers: [AuthService, ConfigService, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
