import { Body, Controller, HttpCode, HttpStatus, Post, UseFilters } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchRequestDto } from './dto/search-request.dto';
import { BenefitsService } from './benefits.service';
import { AllExceptionsFilter } from 'src/common/filters/exception.filters';

@ApiTags('Benefits') // Grouping the APIs under the "Benefits" tag in Swagger
@Controller('benefits')
export class BenefitsController {

    constructor(private readonly benefitsService: BenefitsService) { }
 
    @UseFilters(new AllExceptionsFilter())
    @Post('search')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Search Benefits',
        description: 'Search for benefits based on the provided context and message.',
    })
    searchBenefits(@Body() searchRequestDto: SearchRequestDto): any {
        // Mock response for now
        return this.benefitsService.searchBenefits(searchRequestDto);
    }
}
