import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ListApplicationsDto } from './dto/list-applications.dto';

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
  async findAll(listDto: ListApplicationsDto) {
    const where: Prisma.ApplicationsWhereInput = {};
    if (listDto.benefitId) {
      where.benefitId = listDto.benefitId;
    }
    
   const data = await this.prisma.applications.findMany({
      where,
    });
    if (!data.length) {
      throw new NotFoundException('Applications not found');
    }
    return data;
    
  }

  // Get a single application by ID
  async findOne(id: number) {
    const application = await this.prisma.applications.findUnique({
      where: { id },
      include: {
        applicationFiles: true
      }
    });
    if(!application){
      throw new NotFoundException('Applications not found');
    }
    return application;
  }

  // Update an application by ID
  async update(id: number, data: Prisma.ApplicationsUpdateInput) {
    return this.prisma.applications.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: number, updateStatusDto: UpdateApplicationStatusDto) {
    const application = await this.prisma.applications.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    const updatedApplication = await this.prisma.applications.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
      },
    });

    return {
      statusCode: 200,
      status: 'success',
      message: `Application ${updateStatusDto.status} successfully`,
    };
  }
}
