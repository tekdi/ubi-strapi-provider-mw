import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBasicAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { StrapiAdminService } from './strapi-admin.service';
import { StrapiAdminProviderDto } from './dto/strapi-admin-provider.dto';
import { getAuthToken } from 'src/common/util';

@Controller('strapi-admin')
export class StrapiAdminController {
  constructor(private readonly strapiAdminService: StrapiAdminService) { }

  @Post('roles')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'API requires super admin access' })
  @ApiBasicAuth('access-token')
  async createRole(
    @Req() req: Request,
    @Body() strapiAdminProviderDto: StrapiAdminProviderDto,
  ): Promise<any> {
    const authToken = getAuthToken(req);
    return this.strapiAdminService.createRole(strapiAdminProviderDto, authToken);
  }
}