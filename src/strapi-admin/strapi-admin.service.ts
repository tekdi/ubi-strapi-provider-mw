import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StrapiAdminProviderDto } from './dto/strapi-admin-provider.dto';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class StrapiAdminService {
  private readonly strapiUrl: string;
  private readonly adminEmail: string;
  private readonly adminPassword: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService
  ) {
    this.strapiUrl = this.configService.get<string>('STRAPI_URL') ?? '';
    this.adminEmail = this.configService.get<string>('STRAPI_ADMIN_EMAIL') ?? '';
    this.adminPassword = this.configService.get<string>('STRAPI_ADMIN_PASSWORD') ?? '';
  }

  onModuleInit() {
    if (
      !this.adminEmail.trim().length ||
      !this.strapiUrl.trim().length ||
      !this.adminPassword.trim().length
    ) {
      throw new InternalServerErrorException(
        'One or more required environment variables are missing or empty: STRAPI_URL, STRAPI_TOKEN, PROVIDER_UBA_UI_URL, BAP_ID, BAP_URI, BPP_ID, BPP_URI',
      );
    }
  }

  async createRole(strapiAdminProviderDto: StrapiAdminProviderDto,): Promise<any> {
    const rolesEndpoint = `${this.strapiUrl}/admin/roles`;
    try {
      const jwtData = await this.authService.adminLogin({
        email: this.adminEmail,
        password: this.adminPassword,
      });

      if (!jwtData?.data?.token) {
        throw new HttpException(
          'Failed to retrieve JWT token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const token = jwtData.data.token;

      const response = await this.httpService.axiosRef.post(
        rolesEndpoint,
        {
          name: strapiAdminProviderDto.name,
          description: strapiAdminProviderDto.description,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'authorization': `Bearer ${token}`,
          },
        },
      );

      const responseData = response?.data?.data;

      const roleData = await this.prisma.provider.create({
        data: {
          strapiId: responseData.id,
          strapidocumentId: responseData.documentId,
          name: responseData.name,
          description: responseData.description,
          strapiRole: [responseData.name],
          strapiCode: responseData.code,
          locale: responseData.locale,
          publishedAt: responseData.publishedAt,
        }
      })

      if (!roleData) {
        throw new HttpException(
          'Failed to create role in the database',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return roleData;
    } catch (error) {
      if (error.isAxiosError) {
        throw new HttpException(
          error.response?.data ?? 'Role creation failed',
          error.response?.status ?? HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        error.message ?? 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}