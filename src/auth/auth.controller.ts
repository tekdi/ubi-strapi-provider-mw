import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { LoginDto } from './dto/login-request.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(public authService: AuthService) {}

  @Post('/login')
  @UsePipes(ValidationPipe)
  login(@Body() req: LoginDto) {
    return this.authService.login(req);
  }
}
