import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { LoginDto } from './dto/login-request.dto';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(public authService: AuthService) {}

  @Public()
  @Post('/login')
  @UsePipes(ValidationPipe)
  login(@Body() req: LoginDto) {
    return this.authService.login(req);
  }
}
