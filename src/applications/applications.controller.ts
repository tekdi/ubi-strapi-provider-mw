import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { Prisma } from '@prisma/client';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // Create a new application
  @Post()
  async create(@Body() data: Prisma.ApplicationsCreateInput) {
    return this.applicationsService.create(data);
  }

  // Get all applications
  @Get()
  async findAll() {
    return this.applicationsService.findAll();
  }

  // Get a single application by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(Number(id));
  }

  // Update an application by ID
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Prisma.ApplicationsUpdateInput) {
    return this.applicationsService.update(Number(id), data);
  }
}
