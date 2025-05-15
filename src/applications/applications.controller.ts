import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseFilters, BadRequestException, UsePipes, ValidationPipe, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationsDto } from './dto/create-applications.dto';
import { UpdateApplicationsDto } from './dto/update-applications.dto';
import { Prisma } from '@prisma/client';
import { AllExceptionsFilter } from 'src/common/filters/exception.filters';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ListApplicationsDto } from './dto/list-applications.dto';
import { ApplicationStatusValidationPipe } from './pipes/application-status-validation.pipe';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApplicationsApiDocs } from '../docs';
import { CsvExportApplicationsDto } from './dto/csvexport-applications.dto';
import { Response } from 'express';
@UseFilters(new AllExceptionsFilter())
@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation(ApplicationsApiDocs.create.operation)
  @ApiBody(ApplicationsApiDocs.create.body)
  @ApiResponse(ApplicationsApiDocs.create.responses.success)
  @ApiResponse(ApplicationsApiDocs.create.responses.badRequest)
  async create(@Body() data: CreateApplicationsDto) {
    return this.applicationsService.create(data as Prisma.ApplicationsCreateInput);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation(ApplicationsApiDocs.findAll.operation)
  @ApiResponse(ApplicationsApiDocs.findAll.responses.success)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async findAll(@Query() listDto: ListApplicationsDto) {
    return this.applicationsService.findAll(listDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation(ApplicationsApiDocs.findOne.operation)
  @ApiParam(ApplicationsApiDocs.findOne.param)
  @ApiResponse(ApplicationsApiDocs.findOne.responses.success)
  @ApiResponse(ApplicationsApiDocs.findOne.responses.notFound)
  async findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(Number(id));
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation(ApplicationsApiDocs.update.operation)
  @ApiParam(ApplicationsApiDocs.update.param)
  @ApiBody(ApplicationsApiDocs.update.body)
  @ApiResponse(ApplicationsApiDocs.update.responses.success)
  @ApiResponse(ApplicationsApiDocs.update.responses.badRequest)
  @ApiResponse(ApplicationsApiDocs.update.responses.notFound)
  async update(@Param('id') id: string, @Body() data: UpdateApplicationsDto) {
    return this.applicationsService.update(Number(id), data as Prisma.ApplicationsUpdateInput);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard)
  @ApiOperation(ApplicationsApiDocs.updateStatus.operation)
  @ApiParam(ApplicationsApiDocs.updateStatus.param)
  @ApiBody(ApplicationsApiDocs.updateStatus.body)
  @ApiResponse(ApplicationsApiDocs.updateStatus.responses.success)
  @ApiResponse(ApplicationsApiDocs.updateStatus.responses.badRequest)
  async updateStatus(
    @Param('id') id: string,
    @Body(new ApplicationStatusValidationPipe()) updateStatusDto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(Number(id), updateStatusDto);
  }

  @Get('/reports/csvexport')
  @ApiOperation({ summary: 'Export applications as CSV', description: 'Exports applications for a given benefitId and report type as a CSV file.' })
  // @ApiBody({ type: CsvExportApplicationsDto })
  @ApiResponse({ status: 200, description: 'CSV file with applications data', schema: { type: 'string', format: 'binary' } })
  @ApiResponse({ status: 400, description: 'Missing or invalid parameters' })
  async csvexport(@Query() dto: CsvExportApplicationsDto, @Res() res: Response) {
    const { benefitId, type } = dto;
    if (!benefitId || !type) {
      throw new BadRequestException('benefitId and type are required');
    }

    const csv = await this.applicationsService.exportApplicationsCsv(benefitId, type);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}_applications.csv"`);
    res.send(csv);
  }
}
