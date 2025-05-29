import { HttpService } from '@nestjs/axios';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly strapiUrl: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.strapiUrl = this.configService.get<string>('STRAPI_URL') ?? '';
  }

  async login(req: { email: string; password: string }): Promise<any> {
    const loginEndpoint = `${this.strapiUrl}/admin/login`;
    try {
      const response = await this.httpService.axiosRef.post(
        loginEndpoint,
        {
          email: req.email,
          password: req.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      if (error.isAxiosError) {
        throw new HttpException(
          error.response?.data ?? 'Login failed',
          error.response?.status ?? HttpStatus.BAD_REQUEST,
        );
      }
      // Re-throw other errors
      throw new HttpException(
        error.message ?? 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
