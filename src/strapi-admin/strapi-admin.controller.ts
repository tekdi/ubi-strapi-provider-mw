import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { StrapiAdminService } from './strapi-admin.service';
import { StrapiAdminProviderDto } from './dto/strapi-admin-provider.dto';

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
    const authorization = req.headers['authorization'] ?? req.headers['Authorization'];
    return this.strapiAdminService.createRole(strapiAdminProviderDto, authorization);
  }
}
