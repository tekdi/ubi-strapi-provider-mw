import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { ApiBasicAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { StrapiAdminService } from './strapi-admin.service';
import { StrapiAdminProviderDto } from './dto/strapi-admin-provider.dto';

@Controller('strapi-admin')
export class StrapiAdminController {
  constructor(private readonly strapiAdminService: StrapiAdminService) { }

  @Post('roles')
  @UseGuards(AuthGuard)
  @ApiBasicAuth('access-token')
  async createRole(
    @Body() strapiAdminProviderDto: StrapiAdminProviderDto,
    @Headers('authorization') authorization: string,
  ): Promise<any> {
    return this.strapiAdminService.createRole(strapiAdminProviderDto, authorization);
  }
}
