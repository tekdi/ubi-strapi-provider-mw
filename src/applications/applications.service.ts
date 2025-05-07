import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) { }

  // Create a new application
  async create(data: Prisma.ApplicationsCreateInput) {
    return this.prisma.applications.create({
      data,
    });
  }

  // Get all applications
  async findAll() {
    return this.prisma.applications.findMany({
      include: {
        applicationFiles: true, // Include related ApplicationFiles
      },
    });
  }

  // Get a single application by ID
  async findOne(id: number) {
    return this.prisma.applications.findUnique({
      where: { id },
      include: {
        applicationFiles: true, // Include related ApplicationFiles
      },
    });
  }

  // Update an application by ID
  async update(id: number, data: Prisma.ApplicationsUpdateInput) {
    return this.prisma.applications.update({
      where: { id },
      data,
    });
  }
}
