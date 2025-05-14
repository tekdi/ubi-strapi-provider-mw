import { Injectable,Inject, NotFoundException,forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, ApplicationFiles } from '@prisma/client';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ListApplicationsDto } from './dto/list-applications.dto';

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { BenefitsService } from 'src/benefits/benefits.service';
<<<<<<< HEAD

export interface BenefitDetail {
  id: string;
  documentId: string;
  name: string;
}
=======
>>>>>>> 2f8ae3e27698afcf3999ed586ba140bbfc1a0c1c

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => BenefitsService))
    private readonly benefitsService: BenefitsService
  ) {}

  // Create a new application
  async create(data: any) {
    // Split fields into base64 and normal
    const base64Fields: { key: string; value: string }[] = [];
    const normalFields: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && value.startsWith('base64,')) {
        base64Fields.push({ key, value });
      } else {
        normalFields[key] = value;
      }
    }

    // Prepare application record
    if (!data.benefitId) {
      throw new Error('benefitId is required');
    }
    const benefitId = data.benefitId;
    const customerId = uuidv4();
    const bapId = data.bapId || data.bapid || data.bapID || null;
    const status = 'pending';

    // Save application (normal fields as applicationData)
    const application = await this.prisma.applications.create({
      data: {
        benefitId,
        status,
        customerId,
        bapId,
        applicationData: normalFields,
      },
    });
    const applicationId = application.id;

    // Prepare uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Process base64 fields
    const applicationFiles: ApplicationFiles[] = [];
    for (const { key, value } of base64Fields) {
      // Remove the 'base64,' prefix from the value to get the actual base64 content
      const base64Content = value.replace(/^base64,/, '');

      // Generate a unique filename using applicationId, key, timestamp, and a random number
      let filename = `${applicationId}_${key}_${Date.now()}_${Math.floor(Math.random() * 10000)}.json`;

      // Sanitize filename: remove spaces and strange characters, make lowercase for safe file storage
      filename = filename
        .replace(/[^a-zA-Z0-9-_\.]/g, '') // keep alphanumeric, dash, underscore, dot
        .replace(/\s+/g, '') // remove spaces
        .toLowerCase();

      const filePath = path.join(uploadsDir, filename);
      const decodedContent = Buffer.from(base64Content, 'base64');
      fs.writeFileSync(filePath, decodedContent);

      // Save ApplicationFiles record
      const appFile = await this.prisma.applicationFiles.create({
        data: {
          storage: 'local',
          filePath: path.relative(process.cwd(), filePath),
          applicationId: applicationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      applicationFiles.push(appFile);
    }

    return {
      application,
      applicationFiles,
    };
  }

  // Get all applications with benefit details
  async findAll(listDto: ListApplicationsDto) {
    const applications = await this.prisma.applications.findMany({
      where: {
        benefitId: listDto.benefitId
      },
    });

    // Enrich applications with benefit details
    const benefit: BenefitDetail[] = [];
    try {
      const benefitDetail = await this.benefitsService.getBenefitsById(`${listDto.benefitId}`);
      const obj = {
        id: benefitDetail?.data?.data?.id,
        documentId: benefitDetail?.data?.data?.documentId,
        name: benefitDetail?.data?.data?.title,
      }
      benefit.push(obj)
    } catch (error) {
      console.error(`Error fetching benefit details for application22:`, error.message);
    }     

    return {applications, benefit};
  }

  // Get a single application by ID
  async findOne(id: number) {
    const application = await this.prisma.applications.findUnique({
      where: { id },
      include: {
        applicationFiles: true
      }
    });
    if (!application) {
      throw new NotFoundException('Applications not found');
    }

    // Add base64 file content to each applicationFile
    if (application.applicationFiles && Array.isArray(application.applicationFiles)) {
      application.applicationFiles = application.applicationFiles.map(file => {
        if (file.filePath) {
          try {
            const absPath = path.isAbsolute(file.filePath)
              ? file.filePath
              : path.join(process.cwd(), file.filePath);
            if (fs.existsSync(absPath)) {
              const fileBuffer = fs.readFileSync(absPath);
              const base64Content = fileBuffer.toString('base64');
              return { ...file, fileContent: base64Content };
            }
          } catch (err) {
            // Optionally log error
          }
        }
        return { ...file, fileContent: null };
      });
    }
    
    const benefit: BenefitDetail[] = [];
    try {
      const benefitDetail = await this.benefitsService.getBenefitsById(`${application.benefitId}`);
      const obj = {
        id: benefitDetail?.data?.data?.id,
        documentId: benefitDetail?.data?.data?.documentId,
        name: benefitDetail?.data?.data?.title,
      }
      benefit.push(obj)
    } catch (error) {
      console.error(`Error fetching benefit details for application22:`, error.message);
    }     

    return {application, benefit};
  }

  async find(where: Prisma.ApplicationsWhereInput) {
    const application = await this.prisma.applications.findMany({
      where,
    })
    if (!application) {
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
      data: updateStatusDto
    });

    return {
      statusCode: 200,
      status: 'success',
      message: `Application ${updatedApplication.status} successfully`,
      data: updatedApplication,
    };
  }
}
