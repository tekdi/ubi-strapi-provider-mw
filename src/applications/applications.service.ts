import { Injectable, Inject, NotFoundException, forwardRef, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, ApplicationFiles } from '@prisma/client';
import { UpdateApplicationActionLogDto, UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ListApplicationsDto } from './dto/list-applications.dto';

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { BenefitsService } from 'src/benefits/benefits.service';
import reportsConfig from '../common/reportsConfig.json';
export interface BenefitDetail {
  id: string;
  documentId: string;
  title: string;
}

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => BenefitsService))
    private readonly benefitsService: BenefitsService
  ) { }

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
    const bapId = data.bapId ?? data.bapid ?? data.bapID ?? null;
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
      // A - Process base64 fields for uploads
      // A1.1 Generate a unique filename using applicationId, key, timestamp, and a random number
      let filename = `${applicationId}_${key}_${Date.now()}_${Math.floor(Math.random() * 10000)}.json`;

      // A1.2 Sanitize filename: remove spaces and strange characters, make lowercase for safe file storage
      filename = filename
        .replace(/[^a-zA-Z0-9-_.]/g, '') // keep alphanumeric, dash, underscore, dot
        .replace(/\s+/g, '') // remove spaces
        .toLowerCase();
      const filePath = path.join(uploadsDir, filename);

      // A2.1 - Remove base64, from start of the content
      const base64Content = value.replace(/^base64,/, '');
      // A2.2 - base64-decode to get the URL-encoded string (as we expect text (like JSON), save as string)
      const urlEncoded = Buffer.from(base64Content, 'base64').toString('utf-8');
      // A2.3 - URL-decode to get the original content
      const decodedContent = decodeURIComponent(urlEncoded);
      fs.writeFileSync(filePath, decodedContent, 'utf-8');

      // B - Save ApplicationFiles record
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
    let benefit: BenefitDetail | null = null;
    try {
      const benefitDetail = await this.benefitsService.getBenefitsById(`${listDto.benefitId}`);
      benefit = {
        id: benefitDetail?.data?.data?.id,
        documentId: benefitDetail?.data?.data?.documentId,
        title: benefitDetail?.data?.data?.title,
      }

    } catch (error) {
      console.error(`Error fetching benefit details for application22:`, error.message);
    }

    return { applications, benefit };
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
          const absPath = path.isAbsolute(file.filePath)
            ? file.filePath
            : path.join(process.cwd(), file.filePath);
          if (fs.existsSync(absPath)) {
            const fileBuffer = fs.readFileSync(absPath);
            const base64Content = fileBuffer.toString('base64');
            return { ...file, fileContent: base64Content };
          }
        }
        return { ...file, fileContent: null };
      });
    }

    let benefitDetails
    try {
      benefitDetails = await this.benefitsService.getBenefitsById(`${application.benefitId}`);

    } catch (error) {
      console.error(`Error fetching benefit details for application22:`, error.message);

    }
    if (application) {
      (application as any).benefitDetails = {
        id: benefitDetails?.data?.data?.id,
        documentId: benefitDetails?.data?.data?.documentId,
        title: benefitDetails?.data?.data?.title,

      };
    }

    return application;
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

  async updateStatus(id: number, updateStatusDto: UpdateApplicationStatusDto, actionLog: UpdateApplicationActionLogDto) {
    const application = await this.prisma.applications.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    if (application.actionLog && Array.isArray(application.actionLog)) {
      application.actionLog.push(
        this.getActionLogEntry(actionLog, updateStatusDto.status, updateStatusDto.remark)
      );
    } else {
      application.actionLog = [
        this.getActionLogEntry(actionLog, updateStatusDto.status, updateStatusDto.remark)
      ];
    }

    const updatedApplication = await this.prisma.applications.update({
      where: { id },
      data: { ...updateStatusDto, updatedBy: actionLog.updatedBy, actionLog: application.actionLog },
    });

    return {
      statusCode: 200,
      status: 'success',
      message: `Application ${updatedApplication.status} successfully`,
      data: {
        id: updatedApplication.id,
        status: updatedApplication.status,
        benefitId: updatedApplication.benefitId,
      },
    };
  }

  getActionLogEntry(actionLog: UpdateApplicationActionLogDto, status: string, remark: string) {
    return JSON.stringify({
      ...actionLog,
      status,
      remark
    })

  }

  async exportApplicationsCsv(benefitId: string, reportType: string): Promise<string> {
    if (!benefitId || !reportType) {
      throw new BadRequestException('benefitId and type are required');
    }

    const reports = reportsConfig;

    // Get report config
    const reportConfig = reports[reportType];
    if (!reportConfig) {
      throw new BadRequestException('Invalid report type');
    }
    const autoGenerateFields = reportConfig.autoGenerateFields || [];
    const applicationDataColumnDataFields = reportConfig.applicationDataColumnDataFields || [];
    const applicationTableDataFields = reportConfig.applicationTableDataFields || [];

    let applications: any[] = [];
    try {
      applications = await this.prisma.applications.findMany({
        where: { benefitId: benefitId },
      });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch applications: ${error.message}`);
    }

    const generateCsvRows = (applications: any[], headerFields: string[], appDataFields: string[]) => {
      // Helper function to generate CSV rows
      const csvRows = [headerFields.join(',')];

      for (const [i, app] of applications.entries()) {
        const row: (string | number)[] = [];

        // Auto-generate fields
        for (const field of autoGenerateFields) {
          if (field === 'serialNumber') {
            row.push((i + 1).toString());
          } else {
            row.push('');
          }
        }

        // Application data fields
        for (const field of appDataFields) {
          row.push(app.applicationData && app.applicationData[field] !== undefined
            ? app.applicationData[field]
            : '');
        }

        // Application table data fields
        for (const field of applicationTableDataFields) {
          if (field === 'amount') {
            row.push(app.finalAmount !== undefined ? app.finalAmount : '');
          } else {
            row.push(app[field] !== undefined ? app[field] : '');
          }
        }

        csvRows.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
      }

      return csvRows.join('\n');
    };

    let dynamicAppDataFields: string[] = [];

    if (applicationDataColumnDataFields.length === 1 && applicationDataColumnDataFields[0] === '*') {
      // Fetch applications first to get all keys
      const fieldSet = new Set<string>();
      for (const app of applications) {
        if (app.applicationData && typeof app.applicationData === 'object') {
          Object.keys(app.applicationData).forEach(key => fieldSet.add(key));
        }
      }
      dynamicAppDataFields = Array.from(fieldSet);

      const headerFields = [...autoGenerateFields, ...dynamicAppDataFields, ...applicationTableDataFields];
      return generateCsvRows(applications, headerFields, dynamicAppDataFields);
    }

    const headerFields = [...autoGenerateFields, ...applicationDataColumnDataFields, ...applicationTableDataFields];
    return generateCsvRows(applications, headerFields, applicationDataColumnDataFields);
  }
}
