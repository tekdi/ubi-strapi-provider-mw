import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ApplicationFilesService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new ApplicationFile
  async create(data: Prisma.ApplicationFilesUncheckedCreateInput) {
    return this.prisma.applicationFiles.create({
      data,
    });
  }

  // Get all ApplicationFiles
  async findAll() {
    return this.prisma.applicationFiles.findMany({
      include: {
        application: true, // Include related Applications
      },
    });
  }

  // Get a single ApplicationFile by ID
  async findOne(id: number) {
    return this.prisma.applicationFiles.findUnique({
      where: { id },
      include: {
        application: true, // Include related Applications
      },
    });
  }

  // Update an ApplicationFile by ID
  async update(id: number, data: Prisma.ApplicationFilesUpdateInput) {
    return this.prisma.applicationFiles.update({
      where: { id },
      data,
    });
  }
}
