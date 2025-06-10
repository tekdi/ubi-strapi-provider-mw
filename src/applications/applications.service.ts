import { Injectable, Inject, NotFoundException, forwardRef, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, ApplicationFiles } from '@prisma/client';
import { Request } from 'express';
import { UpdateApplicationActionLogDto, UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ListApplicationsDto } from './dto/list-applications.dto';
import { getAuthToken } from '../common/util';
import { v4 as uuidv4 } from 'uuid';
import { BenefitsService } from 'src/benefits/benefits.service';
import reportsConfig from '../common/reportsConfig.json';
import { IFileStorageService } from '../services/cloud-service/file-storage.interface';

export interface BenefitDetail {
  id: string;
  documentId: string;
  title: string;
}

type ApplicationData = Record<string, any>;

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => BenefitsService))
    private readonly benefitsService: BenefitsService,
    @Inject('FileStorageService')
    private fileStorageService: IFileStorageService,
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

    // Process base64 fields
    const applicationFiles: ApplicationFiles[] = [];
    for (const { key, value } of base64Fields) {

      // A.1 - Remove base64, from start of the content
      const base64Content = value.replace(/^base64,/, '');
      // A.2 - base64-decode to get the URL-encoded string (as we expect text (like JSON), save as string)
      const urlEncoded = Buffer.from(base64Content, 'base64').toString('utf-8');
      // A.3 - URL-decode to get the original content
      const decodedContent = decodeURIComponent(urlEncoded);

      // A.4 - Use fileStorageService for upload
      let storageKey: string;
      try {
        storageKey = await this.fileStorageService.uploadFile(decodedContent, `applications/${applicationId}/${key}`);
        console.log(`File uploaded to storage: ${storageKey}`);
      } catch (err) {
        console.error('Error uploading file to storage:', err.message);
        throw new BadRequestException('Failed to upload file. Please try again later.');
      }

      // B - Save ApplicationFiles record
      try {
        const appFile = await this.prisma.applicationFiles.create({
          data: {
            storage: process.env.FILE_STORAGE_PROVIDER || 'local',
            filePath: storageKey,
            applicationId: applicationId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        applicationFiles.push(appFile);
      } catch (err) {
        console.error('Error saving ApplicationFiles record:', err.message);
        throw new BadRequestException('Failed to save file record. Please try again later.');
      }
    }

    return {
      application,
      applicationFiles,
    };
  }

  // Get all applications with benefit details
  async findAll(listDto: ListApplicationsDto, req : Request) {
    const authToken = getAuthToken(req);
    const applications = await this.prisma.applications.findMany({
      where: {
        benefitId: listDto.benefitId
      },
    });

    // Enrich applications with benefit details
    let benefit: BenefitDetail | null = null;
    try {
      const benefitDetail = await this.benefitsService.getBenefitsByIdStrapi(`${listDto.benefitId}`, authToken);
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
  async findOne(id: number, req: Request) {
    const authToken = getAuthToken(req);
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
      application.applicationFiles = await Promise.all(application.applicationFiles.map(async file => {
        if (file.filePath) {
          let decodedContent: string | null = null;
          try {
            decodedContent = await this.fileStorageService.getFile(file.filePath);
          } catch (err) {
            decodedContent = null;
          }
          const base64Content = decodedContent ? Buffer.from(decodedContent).toString('base64') : null;
          return { ...file, fileContent: base64Content };
        }
        return { ...file, fileContent: null };
      }));
    }

    let benefitDetails
    try {
      benefitDetails = await this.benefitsService.getBenefitsByIdStrapi(`${application.benefitId}`, authToken);

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

  async findUniqueApplication(id: number) {
    return await this.prisma.applications.findUnique({
      where: { id },
      include: {
        applicationFiles: true
      }
    });
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

    const reportConfig = reportsConfig[reportType];
    if (!reportConfig) {
      throw new BadRequestException('Invalid report type');
    }

    const {
      autoGenerateFields = [],
      applicationDataColumnDataFields = [],
      calculatedAmountColumnDataFields = [],
      applicationTableDataFields = []
    } = reportConfig;

    const applications = await this.fetchApplications(benefitId);

    const finalAppDataFields = this.resolveDynamicFields(
      applications,
      applicationDataColumnDataFields,
      'applicationData'
    );

    const finalCalcAmountFields = this.resolveDynamicFields(
      applications,
      calculatedAmountColumnDataFields,
      'calculatedAmount',
      ['totalPayout']
    );

    const headerFields = [
      ...autoGenerateFields,
      ...finalAppDataFields,
      ...finalCalcAmountFields,
      ...applicationTableDataFields
    ];

    const csvRows = [headerFields.join(',')];

    for (const [index, app] of applications.entries()) {
      const row = [
        ...this.generateAutoFields(autoGenerateFields, index),
        ...this.generateAppDataFields(app, finalAppDataFields),
        ...this.generateCalcAmountFields(app, finalCalcAmountFields),
        ...this.generateAppTableFields(app, applicationTableDataFields)
      ];
      csvRows.push(this.escapeCsvRow(row));
    }

    return csvRows.join('\n');
  }

  // --- Helper Methods ---

  private async fetchApplications(benefitId: string): Promise<any[]> {
    try {
      return await this.prisma.applications.findMany({
        where: {
          benefitId,
          // status: {
          // 	notIn: ['rejected', 'Rejected', 'pending', 'Pending', 'reject'],
          // },
        },
      });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch applications: ${error.message}`);
    }
  }

  private resolveDynamicFields(
    apps: any[],
    fields: string[],
    source: 'applicationData' | 'calculatedAmount',
    excludeFields: string[] = []
  ): string[] {
    if (!Array.isArray(fields)) return [];

    const isWildcard = fields.length === 1 && fields[0] === '*';

    const keySet = new Set<string>();
    for (const app of apps) {
      const sourceData = app[source];
      if (sourceData && typeof sourceData === 'object') {
        Object.keys(sourceData).forEach(key => {
          if (!excludeFields.includes(key)) {
            keySet.add(key);
          }
        });
      }
    }

    if (isWildcard) {
      return Array.from(keySet).sort((a, b) => a.localeCompare(b));
    }

    return fields.filter(field => !excludeFields.includes(field));
  }


  private generateAutoFields(fields: string[], index: number): (string | number)[] {
    return fields.map(field => field === 'serialNumber' ? index + 1 : '');
  }

  private generateAppDataFields(app: any, fields: string[]): string[] {
    return fields.map(field => {
      if (field === 'otr') return app.applicationData?.nspOtr ?? '';
      if (field === 'aadhaar') return app.applicationData?.aadhaar?.slice(-4) ?? '';
      return app.applicationData?.[field] ?? '';
    });
  }

  private generateCalcAmountFields(app: any, fields: string[]): any[] {
    const calcAmountData = app.calculatedAmount ?? {};
    return fields.map(field => {
      const value = calcAmountData[field];
      return value ?? '';
    });
  }

  private generateAppTableFields(app: any, fields: string[]): (string | number)[] {
    return fields.map(field => {
      if (field === 'amount') return app.finalAmount ?? '';
      if (field === 'applicationId') return app.id ?? '';
      return app[field] ?? '';
    });
  }

  private escapeCsvRow(row: (string | number)[]): string {
    return row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
  }

  // Get a single application by ID
  async calculateBenefit(id: number, authToken: string) {
    const application = await this.prisma.applications.findUnique({
      where: { id }
    });

    if (!application) {
      throw new NotFoundException('Applications not found');
    }

    const benefitDetails = await this.benefitsService.getBenefitsByIdStrapi(`${application.benefitId}`, authToken);

    if (!benefitDetails?.data?.data) {
      throw new NotFoundException('Benefit details not found');
    }

    let amounts;
    amounts = await this.doBenefitCalculations(application.applicationData, benefitDetails?.data?.data);
    try {
      await this.update(id, {
        calculatedAmount: amounts,
        finalAmount: `${amounts?.totalPayout}`,
        calculationsProcessedAt: new Date()
      })
    } catch (err) {
      console.error(`Error updating benefit details for application: ${id}`, err.message);
      throw new BadRequestException(`Failed to update benefit details for application ${id}`);
    }
    return amounts;
  }

  /**
  * Main function to calculate benefit payout.
  */
  async doBenefitCalculations(applicationData: any, benefitDefinition: any) {
    const output: Record<string, number> = {};
    let total = 0;

    for (const rule of benefitDefinition.benefitCalculationRules ?? []) {
      let amount = 0;

      switch (rule.type) {
        case "fixed":
          amount = rule.fixedValue ?? 0;
          break;

        case "lookup": {
          const inputVal = applicationData[rule.inputFields[0]];
          const found = rule.lookupTable.find((row: any) => row.match === inputVal);
          amount = found ? found.amount : 0;
          break;
        }

        case "conditional": {
          for (const condition of rule.conditions) {
            const matches = condition.ifExpr
              ? this.evaluateIfExpr(condition.ifExpr, applicationData)
              : Object.entries(condition.if).every(([k, v]) => applicationData[k] === v);

            if (matches) {
              if (condition.then.amount === "value") {
                amount = Number(applicationData[rule.inputFields[0]]) || 0;
              } else {
                amount = Number(condition.then.amount) || 0;
              }
              break;
            }
          }
          break;
        }


        case "formula":
          amount = this.evaluateFormula(rule.formula, applicationData);
          break;

        default:
          console.warn(`Unsupported rule type: ${rule.type}`);
          break;
      }

      output[rule.outputField] = amount;
      total += amount;
    }

    output.totalPayout = total;
    return output;
  }

  /**
 * Very basic and safe math formula evaluator (supports + - * / and variables).
 */
  evaluateFormula(formula: string, context: ApplicationData): number {
    try {
      // Replace variable names in the formula with actual values
      const safeExpr = formula.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, (match) => {
        return typeof context[match] !== "undefined" ? context[match] : "0";
      });

      // Only allow safe characters
      if (!/^[\d\s+\-*/().]+$/.test(safeExpr)) throw new Error("Unsafe formula");

      return Function(`"use strict"; return (${safeExpr})`)(); // evaluated safely
    } catch (err) {
      console.error("Formula evaluation error:", err.message);
      return 0;
    }
  }

  /**
   * Limited expression evaluator supporting basic comparison logic.
   */
  evaluateIfExpr(expr: string, context: ApplicationData): boolean {
    try {
      // Basic parser for comparison operators
      const comparisons = expr.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*([=!<>]+)\s*(true|false|\d+|"[^"]*"|'.*?')/g);

      if (!comparisons) return false;

      return comparisons.every(part => {
        const [, key, op, rawVal] = part.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*([=!<>]+)\s*(.*)/) || [];
        let actual = context[key];
        let expected: any = rawVal;

        if (expected === "true") expected = true;
        else if (expected === "false") expected = false;
        else if (!isNaN(Number(expected))) expected = Number(expected);
        else expected = expected.replace(/^['"]|['"]$/g, "");

        switch (op) {
          case "===": return actual === expected;
          case "!==": return actual !== expected;
          case ">": return actual > expected;
          case "<": return actual < expected;
          case ">=": return actual >= expected;
          case "<=": return actual <= expected;
          default: return false;
        }
      });
    } catch (err) {
      console.error("Expression evaluation error:", err.message);
      return false;
    }
  }
};
