import { Body, Controller, Post } from '@nestjs/common';
import { StrapiAdminService } from './strapi-admin.service';
import { StrapiAdminLoginDto } from './dto/strapi-admin-login.dto';

@Controller('strapi-admin')
export class StrapiAdminController {
  constructor(private readonly strapiAdminService: StrapiAdminService) {}

  @Post('login')
  async login(@Body() strapiAdminLoginDto: StrapiAdminLoginDto): Promise<any> {
    return this.strapiAdminService.adminLogin(strapiAdminLoginDto);
  }
}
