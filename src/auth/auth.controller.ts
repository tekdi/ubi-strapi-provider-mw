import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthApiDocs } from '../docs';
import { StrapiAdminLoginDto } from 'src/strapi-admin/dto/strapi-admin-login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(public authService: AuthService) { }

  @Post('/login')
  @UsePipes(ValidationPipe)
  @ApiOperation(AuthApiDocs.login.operation)
  @ApiBody(AuthApiDocs.login.body)
  @ApiResponse(AuthApiDocs.login.responses.success)
  @ApiResponse(AuthApiDocs.login.responses.unauthorized)
  login(@Body() strapiAdminLoginDto: StrapiAdminLoginDto): Promise<any> {
    return this.authService.adminLogin(strapiAdminLoginDto);
  }
}
