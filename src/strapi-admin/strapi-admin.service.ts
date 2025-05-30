import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StrapiAdminProviderDto } from './dto/strapi-admin-provider.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class StrapiAdminService {
  private readonly strapiUrl: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.strapiUrl = this.configService.get<string>('STRAPI_URL') ?? '';
  }

  onModuleInit() {
    if (
      !this.strapiUrl.trim().length
    ) {
      throw new InternalServerErrorException(
        'One or more required environment variables are missing or empty: STRAPI_URL',
      );
    }
  }

  async createRole(strapiAdminProviderDto: StrapiAdminProviderDto, authorization: string): Promise<any> {
    const rolesEndpoint = `${this.strapiUrl}/admin/roles`;
    try {
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
            'authorization': `${authorization}`,
          },
        },
      );

      const responseData = response?.data?.data;

      const roleData = await this.prisma.provider.create({
        data: {
          catalogManagerId: `${responseData.id}`,
          catalogManagerDocumentId: responseData.documentId,
          name: responseData.name,
          description: responseData.description,
          catalogManagerRole: [responseData.name],
          catalogManagerCode: responseData.code,
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