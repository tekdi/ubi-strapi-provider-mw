import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ListApplicationsDto } from './dto/list-applications.dto';
import { VerifyApplicationVcsResponseDto } from '../verifications/dtos';

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
    const data = await this.prisma.applications.findMany({
      where: {
        benefitId: listDto.benefitId
      },
    });
   
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
        status: updateStatusDto.status
      }
    });

    return {
      statusCode: 200,
      status: 'success',
      message: `Application ${updateStatusDto.status} successfully`,
    };
  }

  async verifyApplicationVcs(applicationId: string): Promise<VerifyApplicationVcsResponseDto> {
    // Mock: Fetch VCs from the database for the given applicationId
    const verifiableCredentials = ['VC1', 'VC2', 'VC3']; // Replace with actual DB query

    // Mock: Perform verification logic
    const isVerified = verifiableCredentials.length > 0; // Replace with actual verification logic

    // Mock: Update verification status in the database
    // Replace with actual DB update logic

    // Return structured response
    return {
      applicationId,
      status: isVerified ? 'verified' : 'unverified',
      verifiedCredentials: isVerified ? verifiableCredentials : [],
      message: isVerified ? 'Verification successful' : 'Verification failed',
    };
  }
}
