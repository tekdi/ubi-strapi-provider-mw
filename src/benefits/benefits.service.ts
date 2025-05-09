import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SearchRequestDto } from './dto/search-request.dto';
import { BENEFIT_CONSTANTS } from 'src/benefits/benefit.contants';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { response } from 'express';

@Injectable()
export class BenefitsService {
  private readonly strapiUrl: string;
  private readonly strapiToken: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.strapiUrl = this.configService.get<string>('STRAPI_URL') || '';
    this.strapiToken = this.configService.get('STRAPI_TOKEN') || '';
  }

  onModuleInit() {
    if (!this.strapiToken.trim().length || !this.strapiUrl.trim().length) {
      throw new InternalServerErrorException(
        'Environment variables STRAPI_URL and STRAPI_TOKEN must be set',
      );
    }
  }

  async getBenefits(searchRequest: SearchRequestDto): Promise<any> {
    if (searchRequest.context.domain === BENEFIT_CONSTANTS.FINANCE) {
      // Example: Call an external API
      const response = await this.httpService.axiosRef.get(
        `${this.strapiUrl}/benefits?populate[tags]=*&populate[benefits][on][benefit.financial-benefit][populate]=*&populate[benefits][on][benefit.non-monetary-benefit][populate]=*&populate[exclusions]=*&populate[references]=*&populate[providingEntity][populate][address]=*&populate[providingEntity][populate][contactInfo]=*&populate[sponsoringEntities][populate][address]=*&populate[sponsoringEntities][populate][contactInfo]=*&populate[eligibility][populate][criteria]=*&populate[documents]=*&populate[applicationProcess]=*&populate[applicationForm][populate][options]=*`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.strapiToken}`,
          },
        },
      );

      return response;
    }

    throw new BadRequestException('Invalid domain provided');
  }

  async searchBenefits(searchRequest: SearchRequestDto): Promise<any> {
    if (searchRequest.context.domain === BENEFIT_CONSTANTS.FINANCE) {
      // Example: Call an external API
      const response = await this.httpService.axiosRef.get(
        `${this.strapiUrl}/benefits?populate[tags]=*&populate[benefits][on][benefit.financial-benefit][populate]=*&populate[benefits][on][benefit.non-monetary-benefit][populate]=*&populate[exclusions]=*&populate[references]=*&populate[providingEntity][populate][address]=*&populate[providingEntity][populate][contactInfo]=*&populate[sponsoringEntities][populate][address]=*&populate[sponsoringEntities][populate][contactInfo]=*&populate[eligibility][populate][criteria]=*&populate[documents]=*&populate[applicationProcess]=*&populate[applicationForm][populate][options]=*`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.strapiToken}`,
          },
        },
      );

      let mappedResponse;

      if (response?.data) {
        mappedResponse = await this.transformScholarshipsToONDCFormat(
          response?.data?.data,
        );
      }

      return mappedResponse;
    }

    throw new BadRequestException('Invalid domain provided');
  }

  async selectBenefitsById(body: any): Promise<any> {
    let id = body.message.order.items[0].id;
    const response = await this.httpService.axiosRef.get(
      `${this.strapiUrl}/benefits/${id}?populate[tags]=*&populate[benefits][on][benefit.financial-benefit][populate]=*&populate[benefits][on][benefit.non-monetary-benefit][populate]=*&populate[exclusions]=*&populate[references]=*&populate[providingEntity][populate][address]=*&populate[providingEntity][populate][contactInfo]=*&populate[sponsoringEntities][populate][address]=*&populate[sponsoringEntities][populate][contactInfo]=*&populate[eligibility][populate][criteria]=*&populate[documents]=*&populate[applicationProcess]=*&populate[applicationForm][populate][options]=*`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.strapiToken}`,
        },
      },
    );
    let mappedResponse;
    if (response?.data) {
      mappedResponse = await this.transformScholarshipsToONDCFormat([
        response?.data?.data,
      ]);
    }

    return mappedResponse;
  }

  async getBenefitsById(id: string): Promise<any> {
    const response = await this.httpService.axiosRef.get(
      `${this.strapiUrl}/benefits/${id}?populate[tags]=*&populate[benefits][on][benefit.financial-benefit][populate]=*&populate[benefits][on][benefit.non-monetary-benefit][populate]=*&populate[exclusions]=*&populate[references]=*&populate[providingEntity][populate][address]=*&populate[providingEntity][populate][contactInfo]=*&populate[sponsoringEntities][populate][address]=*&populate[sponsoringEntities][populate][contactInfo]=*&populate[eligibility][populate][criteria]=*&populate[documents]=*&populate[applicationProcess]=*&populate[applicationForm][populate][options]=*`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.strapiToken}`,
        },
      },
    );

    return response;
  }

  async transformScholarshipsToONDCFormat(apiResponseArray) {
    if (!Array.isArray(apiResponseArray)) {
      throw new Error('Expected an array of scholarships');
    }

    const items = await Promise.all(
      apiResponseArray.map(async (scholarship) => {
        const {
          id,
          title,
          longDescription,
          applicationOpenDate,
          applicationCloseDate,
          eligibility,
          documents,
          benefits,
          exclusions,
          sponsoringEntities,
          applicationForm,
          documentId,
        } = scholarship;

        const [
          eligibilityTags,
          documentTags,
          benefitTags,
          exclusionTags,
          sponsoringEntitiesTags,
          applicationFormTags,
        ] = await Promise.all([
          this.formatEligibilityTags(eligibility),
          this.formatDocumentTags(documents),
          this.formatBenefitTags(benefits),
          this.formatExclusionTags(exclusions),
          this.formatSponsoringEntities(sponsoringEntities),
          this.formatApplicationForm(applicationForm),
        ]);

        return {
          id: documentId,
          descriptor: {
            name: title,
            long_desc: longDescription,
          },
          price: {
            currency: 'INR',
            value: await this.calculateTotalBenefitValue(benefits), // await here!
          },
          time: {
            range: {
              start: new Date(applicationOpenDate).toISOString(),
              end: new Date(applicationCloseDate).toISOString(),
            },
          },
          rateable: false,
          tags: [
            eligibilityTags,
            documentTags,
            benefitTags,
            exclusionTags,
            sponsoringEntitiesTags,
            applicationFormTags,
          ]
            .filter(Boolean)
            .flat(),
        };
      }),
    );

    const firstScholarship = apiResponseArray[0];

    return {
      context: {
        domain: 'onest:financial-support',
        action: 'on_search',
        version: '1.1.0',
        bap_id: 'sample.bap.io',
        bap_uri: 'https://sample.bap.io',
        bpp_id: 'sample.bpp.io',
        bpp_uri: 'https://sample.bpp.io',
        transaction_id: uuidv4(),
        message_id: uuidv4(),
        timestamp: new Date().toISOString(),
        ttl: 'PT10M',
      },
      message: {
        catalog: {
          descriptor: {
            name: 'Protean DSEP Scholarships and Grants BPP Platform',
          },
          providers: [
            {
              id: 'PROVIDER_UNIFIED',
              descriptor: {
                name:
                  firstScholarship?.providingEntity?.name || 'Unknown Provider',
                short_desc: 'Multiple scholarships offered',
                images: firstScholarship?.imageUrl
                  ? [{ url: firstScholarship.imageUrl }]
                  : [],
              },
              categories: [
                {
                  id: 'CAT_SCHOLARSHIP',
                  descriptor: {
                    code: 'scholarship',
                    name: 'Scholarship',
                  },
                },
              ],
              fulfillments: [
                {
                  id: 'FULFILL_UNIFIED',
                  tracking: false,
                },
              ],
              locations: [
                {
                  id: 'L1',
                  city: {
                    name: 'Pune',
                    code: 'std:020',
                  },
                  state: {
                    name: 'Maharashtra',
                    code: 'MH',
                  },
                },
              ],
              items,
            },
          ],
        },
      },
    };
  }

  // Calculate a rough total of monetary benefits if known
  async calculateTotalBenefitValue(benefits) {
    let total = 0;
    benefits.forEach((benefit) => {
      const matches = benefit.description.match(/\₹([\d,]+)/g);
      if (matches) {
        matches.forEach((amount) => {
          total += parseInt(amount.replace(/[₹,]/g, ''), 10);
        });
      }
    });
    return total.toString();
  }

  async formatEligibilityTags(eligibility) {
    if (!eligibility?.length) return null;

    return {
      display: true,
      descriptor: {
        code: 'eligibility',
        name: 'Eligibility',
      },
      list: eligibility.map((e) => ({
        descriptor: {
          code: e.type,
          name: e.type.charAt(0).toUpperCase() + e.type.slice(1),
          short_desc: e.description,
        },
        value: JSON.stringify(e),
        display: true,
      })),
    };
  }

  async formatDocumentTags(documents) {
    if (!documents?.length) return null;

    return {
      display: true,
      descriptor: {
        code: 'required-docs',
        name: 'Required Documents',
      },
      list: documents.map((doc) => ({
        descriptor: {
          code: doc.isRequired ? 'mandatory-doc' : 'optional-doc',
          name: doc.isRequired ? 'Mandatory Document' : 'Optional Document',
        },
        value: JSON.stringify(doc),
        display: true,
      })),
    };
  }

  async formatBenefitTags(benefits) {
    if (!benefits?.length) return null;

    return {
      display: true,
      descriptor: {
        code: 'benefits',
        name: 'Benefits',
      },
      list: benefits.map((b) => ({
        descriptor: {
          code: 'financial',
          name: b.title,
        },
        value: JSON.stringify(b),
        display: true,
      })),
    };
  }

  async formatExclusionTags(exclusions) {
    if (!exclusions?.length) return null;

    return {
      display: true,
      descriptor: {
        code: 'exclusions',
        name: 'Exclusions',
      },
      list: exclusions.map((e) => ({
        descriptor: {
          code: 'ineligibility',
          name: 'Ineligibility Condition',
        },
        value: JSON.stringify(e),
        display: true,
      })),
    };
  }

  async formatSponsoringEntities(sponsoringEntities) {
    if (!sponsoringEntities?.length) return null;

    return {
      display: true,
      descriptor: {
        code: 'sponsoringEntities',
        name: 'Sponsoring Entities',
      },
      list: sponsoringEntities.map((sponsoringEntity) => ({
        descriptor: {
          code: 'sponsoringEntities',
          name: 'Entities Sponsoring Benefits',
        },
        value: JSON.stringify(sponsoringEntity),
        display: true,
      })),
    };
  }

  async formatApplicationForm(applicationForm) {
    if (!applicationForm?.length) return null;

    return {
      display: true,
      descriptor: {
        code: 'applicationForm',
        name: 'Application Form',
      },
      list: applicationForm.map((applicationForm) => ({
        descriptor: {
          code: 'applicationForm',
          name: 'Application Form',
        },
        value: JSON.stringify(applicationForm),
        display: true,
      })),
    };
  }
}
