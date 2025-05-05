import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SearchRequestDto } from './dto/search-request.dto';
import { BENEFIT_CONSTANTS } from 'src/benefits/benefit.contants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BenefitsService {
    private readonly strapiUrl: string;
    private readonly strapiToken: string;
    constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) {
        this.strapiUrl = this.configService.get<string>('STRAPI_URL') || '';
        this.strapiToken = this.configService.get('STRAPI_TOKEN') || '';
    }

    onModuleInit() {
        if (
            !this.strapiToken.trim().length ||
            !this.strapiUrl.trim().length
        ) {
            throw new InternalServerErrorException(
                'Environment variables STRAPI_URL and STRAPI_TOKEN must be set',);
        }
    }

    async searchBenefits(searchRequest: SearchRequestDto): Promise<any> {
        if (searchRequest.context.domain === BENEFIT_CONSTANTS.FINANCE) {
            // Example: Call an external API
            const response = await this.httpService.axiosRef.get(`${this.strapiUrl}/benefits`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.strapiToken}`,
                    },
                    params: {
                        message: searchRequest.message,
                    },
                },
            );
            return response.data; // Return the data from the external API
        }

        throw new BadRequestException('Invalid domain provided');
    }

    async getBenefitsById(id: string): Promise<any> {
        const response = await this.httpService.axiosRef.get(`${this.strapiUrl}/benefits/${id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.strapiToken}`,
                },
            },
        );
        return response.data; // Return the data from the external API
    }
}
