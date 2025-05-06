import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApplicationVCsService } from './applicationVCs.service';
import { Prisma } from '@prisma/client';

@Controller('application-vcs')
export class ApplicationVCsController {
  constructor(private readonly applicationVCsService: ApplicationVCsService) {}

  // Create a new ApplicationVC
  @Post()
  async create(@Body() data: Prisma.ApplicationVCsCreateInput) {
    return this.applicationVCsService.create(data);
  }

  // Get all ApplicationVCs
  @Get()
  async findAll() {
    return this.applicationVCsService.findAll();
  }

  // Get a single ApplicationVC by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.applicationVCsService.findOne(Number(id));
  }

  // Update an ApplicationVC by ID
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Prisma.ApplicationVCsUpdateInput) {
    return this.applicationVCsService.update(Number(id), data);
  }
}
