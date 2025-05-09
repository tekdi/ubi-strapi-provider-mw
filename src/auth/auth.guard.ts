import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    // Check if auth header is present
    if (request.header('authorization') == undefined) {
      throw new UnauthorizedException('Unauthorized');
    }

    // Get token
    const authHeader = request.header('authorization');
    const authTokenParts = request.header('authorization')?.split(' ');
    let bearerToken: string | null = null;
    let bearerTokenParts: string[] | null = null;

    // If Bearer word not found in auth header value
    if (!authTokenParts || authTokenParts[0] !== 'Bearer') {
      throw new UnauthorizedException('Bearer token not found');
    }

    // Get trimmed Bearer token value by skipping Bearer value
    else {
      bearerToken = authHeader?.split(' ')[1] ?? null;
    }

    // If Bearer token value is not passed
    if (!bearerToken) {
      throw new UnauthorizedException('Invalid token');
    }
    // Lets split token by dot (.)
    else {
      bearerTokenParts = bearerToken.split('.');
    }

    // Since JWT has three parts - seperated by dots(.), lets split token
    if (bearerTokenParts.length < 3) {
      throw new UnauthorizedException('Invalid token');
    }

    // Decode and get strapi user id from Token
    const decoded: { id: string; exp: number } = this.verifyToken(
      authHeader as string,
    );
    const strapi_user_id = decoded.id;

    if (strapi_user_id) {
      // Check for token expiry
      if (Date.now() >= decoded.exp * 1000) {
        throw new UnauthorizedException('Token has expired');
      } else {
        return true;
      }
    } else {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private verifyToken(token: string): { id: string; exp: number } {
    try {
      const { id, exp } = jwtDecode<{ id: string; exp: number }>(token);
      return { id, exp };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
