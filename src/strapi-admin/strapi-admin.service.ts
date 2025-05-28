import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StrapiAdminLoginDto } from './dto/strapi-admin-login.dto';

@Injectable()
export class StrapiAdminService {
    private readonly strapiUrl: string;
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
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
                        'Accept-Language': 'en-GB,en;q=0.9',
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
            throw new HttpException(
                error.message ?? 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


}
