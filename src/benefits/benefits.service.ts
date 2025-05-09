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
import { InitRequestDto } from './dto/init-request.dto';

@Injectable()
export class BenefitsService {
  private readonly strapiUrl: string;
  private readonly strapiToken: string;
  private readonly providerUrl: string;
  private readonly bapId: string;
  private readonly bapUri: string;
  private readonly bppId: string;
  private readonly bppUri: string;
  private readonly urlExtension: string =
    '?populate[tags]=*&populate[benefits][on][benefit.financial-benefit][populate]=*&populate[benefits][on][benefit.non-monetary-benefit][populate]=*&populate[exclusions]=*&populate[references]=*&populate[providingEntity][populate][address]=*&populate[providingEntity][populate][contactInfo]=*&populate[sponsoringEntities][populate][address]=*&populate[sponsoringEntities][populate][contactInfo]=*&populate[eligibility][populate][criteria]=*&populate[documents]=*&populate[applicationProcess]=*&populate[applicationForm][populate][options]=*';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.strapiUrl = this.configService.get<string>('STRAPI_URL') || '';
    this.strapiToken = this.configService.get('STRAPI_TOKEN') || '';
    this.providerUrl = this.configService.get('PROVIDER_UBA_UI_URL') || '';
    this.bapId = this.configService.get('BAP_ID') || '';
    this.bapUri = this.configService.get('BAP_URI') || '';
    this.bppId = this.configService.get('BPP_ID') || '';
    this.bppUri = this.configService.get('BPP_URI') || '';
  }

  onModuleInit() {
    if (
      !this.strapiToken.trim().length ||
      !this.strapiUrl.trim().length ||
      !this.providerUrl.trim().length ||
      !this.bapId.trim().length ||
      !this.bapUri.trim().length ||
      !this.bppId.trim().length ||
      !this.bppUri.trim().length
    ) {
      throw new InternalServerErrorException(
        'Environment variables STRAPI_URL and STRAPI_TOKEN must be set',
      );
    }
  }

  async getBenefits(searchRequest: SearchRequestDto): Promise<any> {
    if (searchRequest.context.domain === BENEFIT_CONSTANTS.FINANCE) {
      // Example: Call an external API
      const response = await this.httpService.axiosRef.get(
        `${this.strapiUrl}/benefits${this.urlExtension}`,
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

  async getBenefitsById(id: string): Promise<any> {
    const response = await this.httpService.axiosRef.get(
      `${this.strapiUrl}/benefits/${id}${this.urlExtension}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.strapiToken}`,
        },
      },
    );

    return response;
  }

  async searchBenefits(searchRequest: SearchRequestDto): Promise<any> {
    if (searchRequest.context.domain === BENEFIT_CONSTANTS.FINANCE) {
      // Example: Call an external API
      const response = await this.httpService.axiosRef.get(
        `${this.strapiUrl}/benefits${this.urlExtension}`,
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
          'on_search',
        );
      }

      return mappedResponse;
    }

    throw new BadRequestException('Invalid domain provided');
  }

  async selectBenefitsById(body: any): Promise<any> {
    let id = body.message.order.items[0].id;
    const response = await this.httpService.axiosRef.get(
      `${this.strapiUrl}/benefits/${id}${this.urlExtension}`,
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
        [response?.data?.data],
        'on_select',
      );
    }

    return mappedResponse;
  }

  async init(selectDto: InitRequestDto): Promise<any> {
    try {
      let schemaJson;
      const response = [];
      const benefitId = selectDto.message.order.items[0].id;

      // Fetch benefit data from the strapi
      const benefitData = await this.getBenefitsById(benefitId);

      let mappedResponse;

      if (benefitData?.data) {
        mappedResponse = await this.transformScholarshipsToONDCFormat(
          [benefitData?.data?.data],
          'on_init',
        );
      }

      const xinput = {
        head: {
          descriptor: {
            name: 'Application Form',
          },
          index: {
            min: 0,
            cur: 0,
            max: 1,
          },
          headings: ['Personal Details'],
        },
        form: {
          url: `${this.providerUrl}/${benefitId}/apply`, // React route for the benefit ID
          mime_type: 'text/html',
          resubmit: false,
        },
        required: true,
      };

      const { id, descriptor, categories, locations, items, rateable }: any =
        mappedResponse?.message.catalog.providers[0];

      items[0].xinput = xinput;

      selectDto.message.order = {
        ...selectDto.message.order,
        // Ensure the object matches the InitOrderDto type
        providers: [{ id, descriptor, rateable, locations, categories }],
        items,
      };

      selectDto.context = {
        ...selectDto.context,
        ...mappedResponse?.context,
        action: 'on_init',
      };
      return selectDto;
    } catch (error) {
      console.error('Error in handleInit:', error);
      throw new InternalServerErrorException('Failed to initialize benefit');
    }
  }

  async transformScholarshipsToONDCFormat(apiResponseArray, action?) {
    if (!Array.isArray(apiResponseArray)) {
      throw new Error('Expected an array of scholarships');
    }

    const items = await Promise.all(
      apiResponseArray.map(async (benefit) => {
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
        } = benefit;

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
        action: action,
        version: '1.1.0',
        bap_id: this.bapId,
        bap_uri: this.bapUri,
        bpp_id: this.bppId,
        bpp_uri: this.bppUri,
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
