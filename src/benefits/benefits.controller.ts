import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseFilters,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchRequestDto } from './dto/search-request.dto';
import { BenefitsService } from './benefits.service';
import { AllExceptionsFilter } from 'src/common/filters/exception.filters';

@ApiTags('Benefits') // Grouping the APIs under the "Benefits" tag in Swagger
@Controller('benefits')
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) {}

  @UseFilters(new AllExceptionsFilter())
  @ApiOperation({
    summary: 'Get Benefits by ID',
    description: 'Fetch benefits by their unique identifier.',
  })
  @Get('getById/:docid')
  @HttpCode(HttpStatus.OK)
  getBenefitsById(@Param('docid') id: string): any {
    return this.benefitsService.getBenefitsById(id);
  }

  @UseFilters(new AllExceptionsFilter())
  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search Benefits',
    description:
      'Search for benefits based on the provided context and message.',
  })
  searchBenefits(@Body() searchRequestDto: SearchRequestDto): any {
    return this.benefitsService.getBenefits(searchRequestDto);
  }

  // Network api's routes

  @UseFilters(new AllExceptionsFilter())
  @Post('dsep/search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search Benefits',
    description:
      'Search for benefits based on the provided context and message.',
  })
  searchBenefitsNetwork(@Body() searchRequestDto: SearchRequestDto): any {
    return this.benefitsService.searchBenefits(searchRequestDto);
  }

  @UseFilters(new AllExceptionsFilter())
  @ApiOperation({
    summary: 'Get Benefits by ID',
    description: 'Fetch benefits by their unique identifier.',
  })
  @Get('dsep/select/:id')
  @HttpCode(HttpStatus.OK)
  selectBenefitsNetwork(@Param('docid') id: string): any {
    return this.benefitsService.selectBenefitsById(id);
  }
}
