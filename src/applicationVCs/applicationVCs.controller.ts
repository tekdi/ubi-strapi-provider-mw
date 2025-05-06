import { Controller, Get, Post, Body, Param, Patch, Delete, UseFilters } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { ApplicationVCsService } from './applicationVCs.service';
import { CreateApplicationVCsDto } from './dto/create-applicationVCs.dto';
import { UpdateApplicationVCsDto } from './dto/update-applicationVCs.dto';
import { AllExceptionsFilter } from 'src/common/filters/exception.filters';

@UseFilters(new AllExceptionsFilter())
@ApiTags('ApplicationVCs') // Grouping the endpoints under "ApplicationVCs" in Swagger
@Controller('application-vcs')
export class ApplicationVCsController {
  constructor(private readonly applicationVCsService: ApplicationVCsService) {}

  // Create a new ApplicationVC
  @Post()
  @ApiOperation({ summary: 'Create a new ApplicationVC' })
  @ApiBody({ description: 'ApplicationVC data', type: CreateApplicationVCsDto })
  @ApiResponse({ status: 201, description: 'ApplicationVC created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() data: CreateApplicationVCsDto) {
    return this.applicationVCsService.create(data as Prisma.ApplicationVCsUncheckedCreateInput);
  }

  // Get all ApplicationVCs
  @Get()
  @ApiOperation({ summary: 'Get all ApplicationVCs' })
  @ApiResponse({ status: 200, description: 'List of ApplicationVCs retrieved successfully' })
  async findAll() {
    return this.applicationVCsService.findAll();
  }

  // Get a single ApplicationVC by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a single ApplicationVC by ID' })
  @ApiParam({ name: 'id', description: 'ApplicationVC ID', type: Number })
  @ApiResponse({ status: 200, description: 'ApplicationVC retrieved successfully' })
  @ApiResponse({ status: 404, description: 'ApplicationVC not found' })
  async findOne(@Param('id') id: string) {
    return this.applicationVCsService.findOne(Number(id));
  }

  // Update an ApplicationVC by ID
  @Patch(':id')
  @ApiOperation({ summary: 'Update an ApplicationVC by ID' })
  @ApiParam({ name: 'id', description: 'ApplicationVC ID', type: Number })
  @ApiBody({ description: 'Updated ApplicationVC data', type: UpdateApplicationVCsDto })
  @ApiResponse({ status: 200, description: 'ApplicationVC updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'ApplicationVC not found' })
  async update(@Param('id') id: string, @Body() data: UpdateApplicationVCsDto) {
    return this.applicationVCsService.update(Number(id), data);
  }
}
