import { Controller, Get, Post, Body, Param, Patch, Delete, UseFilters } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationsDto } from './dto/create-applications.dto';
import { UpdateApplicationsDto } from './dto/update-applications.dto';
import { Prisma } from '@prisma/client';
import { AllExceptionsFilter } from 'src/common/filters/exception.filters';

@UseFilters(new AllExceptionsFilter())
@ApiTags('Applications') // Grouping the endpoints under "Applications" in Swagger
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // Create a new application
  @Post()
  @ApiOperation({ summary: 'Create a new application' })
  @ApiBody({ description: 'Application data', type: CreateApplicationsDto })
  @ApiResponse({ status: 201, description: 'Application created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() data: CreateApplicationsDto) {
    return this.applicationsService.create(data as Prisma.ApplicationsCreateInput);
  }

  // Get all applications
  @Get()
  @ApiOperation({ summary: 'Get all applications' })
  @ApiResponse({ status: 200, description: 'List of applications retrieved successfully' })
  async findAll() {
    return this.applicationsService.findAll();
  }

  // Get a single application by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a single application by ID' })
  @ApiParam({ name: 'id', description: 'Application ID', type: Number })
  @ApiResponse({ status: 200, description: 'Application retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(Number(id));
  }

  // Update an application by ID
  @Patch(':id')
  @ApiOperation({ summary: 'Update an application by ID' })
  @ApiParam({ name: 'id', description: 'Application ID', type: Number })
  @ApiBody({ description: 'Updated application data', type: UpdateApplicationsDto })
  @ApiResponse({ status: 200, description: 'Application updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async update(@Param('id') id: string, @Body() data: UpdateApplicationsDto) {
    return this.applicationsService.update(Number(id), data as Prisma.ApplicationsUpdateInput);
  }
}
