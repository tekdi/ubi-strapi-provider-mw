import { Injectable } from '@nestjs/common';
import { SearchRequestDto } from './dto/search-request.dto';
import { BENEFIT_CONSTANTS } from 'src/benefit.contants';

@Injectable()
export class BenefitsService {

    searchBenefits(searchRequest: SearchRequestDto): any {
        // Mock response for now
        if (searchRequest.context.domain === BENEFIT_CONSTANTS.FINANCE) {
            
            return {
                message: 'Search request received',
                data: searchRequest,
            };
        }
    }

}
