import { Controller, Get, Post, Body, Param, Patch, Delete, UseFilters } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { ApplicationFilesService } from './applicationFiles.service';
import { CreateApplicationFilesDto } from './dto/create-applicationfiles.dto';
import { UpdateApplicationFilesDto } from './dto/update-applicationfiles.dto';
import { AllExceptionsFilter } from 'src/common/filters/exception.filters';

@UseFilters(new AllExceptionsFilter())
@ApiTags('ApplicationFiles') // Grouping the endpoints under "ApplicationFiles" in Swagger
@Controller('application-files')
export class ApplicationFilesController {
  constructor(private readonly ApplicationFilesService: ApplicationFilesService) {}

  // Create a new ApplicationFile
  @Post()
  @ApiOperation({ summary: 'Create a new ApplicationFile' })
  @ApiBody({ description: 'ApplicationFile data', type: CreateApplicationFilesDto })
  @ApiResponse({ status: 201, description: 'ApplicationFile created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() data: CreateApplicationFilesDto) {
    const applicationFileData: Prisma.ApplicationFilesUncheckedCreateInput = {
      ...data,
      storage: 'local' // Provide a default or ensure 'storage' is included
    };
    return this.ApplicationFilesService.create(applicationFileData);
  }

  // Get all ApplicationFiles
  @Get()
  @ApiOperation({ summary: 'Get all ApplicationFiles' })
  @ApiResponse({ status: 200, description: 'List of ApplicationFiles retrieved successfully' })
  async findAll() {
    return this.ApplicationFilesService.findAll();
  }

  // Get a single ApplicationFile by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a single ApplicationFile by ID' })
  @ApiParam({ name: 'id', description: 'ApplicationFile ID', type: Number })
  @ApiResponse({ status: 200, description: 'ApplicationFile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'ApplicationFile not found' })
  async findOne(@Param('id') id: string) {
    return this.ApplicationFilesService.findOne(Number(id));
  }

  // Update an ApplicationFile by ID
  @Patch(':id')
  @ApiOperation({ summary: 'Update an ApplicationFile by ID' })
  @ApiParam({ name: 'id', description: 'ApplicationFile ID', type: Number })
  @ApiBody({ description: 'Updated ApplicationFile data', type: UpdateApplicationFilesDto })
  @ApiResponse({ status: 200, description: 'ApplicationFile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'ApplicationFile not found' })
  async update(@Param('id') id: string, @Body() data: UpdateApplicationFilesDto) {
    return this.ApplicationFilesService.update(Number(id), data);
  }
}
