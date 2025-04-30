import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchRequestDto } from './dto/search-request.dto';
import { BenefitsService } from './benefits.service';

@ApiTags('Benefits') // Grouping the APIs under the "Benefits" tag in Swagger
@Controller('benefits')
export class BenefitsController {

    constructor(private readonly benefitsService: BenefitsService) { }

    @Post('search')
    @ApiOperation({
        summary: 'Search Benefits',
        description: 'Search for benefits based on the provided context and message.',
    })
    searchBenefits(@Body() searchRequestDto: SearchRequestDto): any {
        // Mock response for now
        return this.benefitsService.searchBenefits(searchRequestDto);
    }
}
