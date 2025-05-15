import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseFilters, BadRequestException, UsePipes, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBasicAuth } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { ApplicationsService } from './applications.service';
import { CreateApplicationsDto } from './dto/create-applications.dto';
import { UpdateApplicationsDto } from './dto/update-applications.dto';
import { AllExceptionsFilter } from 'src/common/filters/exception.filters';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ListApplicationsDto } from './dto/list-applications.dto';
import { ApplicationStatusValidationPipe } from './pipes/application-status-validation.pipe';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApplicationsApiDocs } from '../docs';
import { UAParser } from 'ua-parser-js';

@UseFilters(new AllExceptionsFilter())
@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) { }

  @Post()
  @ApiOperation(ApplicationsApiDocs.create.operation)
  @ApiBody(ApplicationsApiDocs.create.body)
  @ApiResponse(ApplicationsApiDocs.create.responses.success)
  @ApiResponse(ApplicationsApiDocs.create.responses.badRequest)
  async create(@Body() data: CreateApplicationsDto) {
    return this.applicationsService.create(data as Prisma.ApplicationsCreateInput);
  }

  @Get()
  @ApiBasicAuth('access-token')
  @UseGuards(AuthGuard)
  @ApiOperation(ApplicationsApiDocs.findAll.operation)
  @ApiResponse(ApplicationsApiDocs.findAll.responses.success)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async findAll(@Query() listDto: ListApplicationsDto) {
    return this.applicationsService.findAll(listDto);
  }

  @Get(':id')
  @ApiBasicAuth('access-token')
  @UseGuards(AuthGuard)
  @ApiOperation(ApplicationsApiDocs.findOne.operation)
  @ApiParam(ApplicationsApiDocs.findOne.param)
  @ApiResponse(ApplicationsApiDocs.findOne.responses.success)
  @ApiResponse(ApplicationsApiDocs.findOne.responses.notFound)
  async findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(Number(id));
  }

  @Patch(':id')
  @ApiBasicAuth('access-token')
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
  @ApiBasicAuth('access-token')
  @UseGuards(AuthGuard)
  @ApiOperation(ApplicationsApiDocs.updateStatus.operation)
  @ApiParam(ApplicationsApiDocs.updateStatus.param)
  @ApiBody(ApplicationsApiDocs.updateStatus.body)
  @ApiResponse(ApplicationsApiDocs.updateStatus.responses.success)
  @ApiResponse(ApplicationsApiDocs.updateStatus.responses.badRequest)
  async updateStatus(
    @Param('id') id: string,
    @Body(new ApplicationStatusValidationPipe()) updateStatusDto: UpdateApplicationStatusDto,
    @Req() req: Request,
  ) {
    const parser = new UAParser();

    const userAgent = req.headers['user-agent'] || '';
    const uaResult = parser.setUA(userAgent).getResult();
    const os = uaResult.os.name + ' ' + uaResult.os.version;
    const browser = uaResult.browser.name + ' ' + uaResult.browser.version;
    const updatedBy = req.mw_userid;
    const ip = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    return this.applicationsService.updateStatus(Number(id), updateStatusDto, {
      os, browser, updatedBy: Number(updatedBy), ip, updatedAt: new Date()
    });
  }
}
