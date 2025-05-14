import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from './dto/login-request.dto';
import { AuthService } from './auth.service';
import { AuthApiDocs } from '../docs';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(public authService: AuthService) {}

  @Post('/login')
  @UsePipes(ValidationPipe)
  @ApiOperation(AuthApiDocs.login.operation)
  @ApiBody(AuthApiDocs.login.body)
  @ApiResponse(AuthApiDocs.login.responses.success)
  @ApiResponse(AuthApiDocs.login.responses.unauthorized)
  login(@Body() req: LoginDto) {
    return this.authService.login(req);
  }
}
