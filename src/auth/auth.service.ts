import { HttpService } from '@nestjs/axios';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { StrapiAdminLoginDto } from 'src/strapi-admin/dto/strapi-admin-login.dto';

@Injectable()
export class AuthService {
  private readonly strapiUrl: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.strapiUrl = this.configService.get<string>('STRAPI_URL') ?? '';
  }

  async adminLogin(strapiAdminLoginDto: StrapiAdminLoginDto): Promise<any> {
    const loginEndpoint = `${this.strapiUrl}/admin/login`;
    try {
      const response = await this.httpService.axiosRef.post(
        loginEndpoint,
        {
          email: strapiAdminLoginDto.email,
          password: strapiAdminLoginDto.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response?.data?.data?.user) {
        throw new HttpException(
          'Login failed: User data not found',
          HttpStatus.UNAUTHORIZED,
        );
      }
      // Check if user exists in the database to get role
      const user = await this.prisma.users.findUnique({
        where: { s_id: `${response.data.data.user.id}` },
      });

      if (!user) {
        throw new HttpException(
          'Login failed: User not found in the database',
          HttpStatus.UNAUTHORIZED,
        );
      }

      response.data.data.user["s_roles"] = user.s_roles;

      return { ...response.data.data };
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
