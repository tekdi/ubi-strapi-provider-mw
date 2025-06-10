import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { StrapiAdminService } from './strapi-admin.service';
import { StrapiAdminProviderDto } from './dto/strapi-admin-provider.dto';
import { StrapiAdminUserDto } from './dto/strapi-admin-user.dto';

@ApiTags('Strapi Admin')
@Controller('strapi-admin')
export class StrapiAdminController {
  constructor(private readonly strapiAdminService: StrapiAdminService) { }


  @Get('roles')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all roles from Strapi' ,
    description: 'Fetches all roles from Strapi (requires super admin access)'
  })
  @ApiBasicAuth('access-token')
  async getRoles(@Req() req: Request): Promise<any> {
    return this.strapiAdminService.getRoles(req);
  }

  @Post('roles')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create a new role in Strapi',
    description: 'Creates a new role in Strapi with the specified permissions (requires super admin access)'
  })
  @ApiBasicAuth('access-token')
  async createRole(
    @Req() req: Request,
    @Body() strapiAdminProviderDto: StrapiAdminProviderDto,
  ): Promise<any> {
    return this.strapiAdminService.createRole(strapiAdminProviderDto, req);
  }

  @Post('users')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create a new user in Strapi',
    description: 'Creates a new user in Strapi with the specified roles (requires super admin access)'
  })
  @ApiBasicAuth('access-token')
  async createUser(
    @Req() req: Request,
    @Body() strapiAdminUserDto: StrapiAdminUserDto,
  ): Promise<any> {
    return this.strapiAdminService.createUser(strapiAdminUserDto, req);
  }
}
