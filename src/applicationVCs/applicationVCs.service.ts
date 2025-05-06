import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ApplicationVCsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new ApplicationVC
  async create(data: Prisma.ApplicationVCsCreateInput) {
    return this.prisma.applicationVCs.create({
      data,
    });
  }

  // Get all ApplicationVCs
  async findAll() {
    return this.prisma.applicationVCs.findMany({
      include: {
        application: true, // Include related Applications
      },
    });
  }

  // Get a single ApplicationVC by ID
  async findOne(id: number) {
    return this.prisma.applicationVCs.findUnique({
      where: { id },
      include: {
        application: true, // Include related Applications
      },
    });
  }

  // Update an ApplicationVC by ID
  async update(id: number, data: Prisma.ApplicationVCsUpdateInput) {
    return this.prisma.applicationVCs.update({
      where: { id },
      data,
    });
  }
}
