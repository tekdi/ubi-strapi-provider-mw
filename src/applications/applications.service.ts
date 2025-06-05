import {
	Injectable,
	Inject,
	NotFoundException,
	forwardRef,
	BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, ApplicationFiles } from '@prisma/client';
import {
	UpdateApplicationActionLogDto,
	UpdateApplicationStatusDto,
} from './dto/update-application-status.dto';
import { ListApplicationsDto } from './dto/list-applications.dto';
import { generateRandomString } from '../common/util';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { BenefitsService } from 'src/benefits/benefits.service';
import reportsConfig from '../common/reportsConfig.json';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface BenefitDetail {
	id: string;
	documentId: string;
	title: string;
}

type ApplicationData = Record<string, any>;
type BenefitDefinition = {
	calculationRules: any[];
};

@Injectable()
export class ApplicationsService {
	private readonly eligibility_base_uri: string;
	constructor(
		private readonly prisma: PrismaService,
		@Inject(forwardRef(() => BenefitsService))
		private readonly benefitsService: BenefitsService,
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,
	) {
		this.eligibility_base_uri =
			this.configService.get('ELIGIBILITY_API_URL') ?? '';
	}

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
			const randomBytes = generateRandomString(); // Generate a secure random string
			let filename = `${applicationId}_${key}_${Date.now()}_${randomBytes}.json`;

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
				benefitId: listDto.benefitId,
			},
		});

		// Enrich applications with benefit details
		let benefit: BenefitDetail | null = null;
		try {
			const benefitDetail = await this.benefitsService.getBenefitsById(
				`${listDto.benefitId}`,
			);
			benefit = {
				id: benefitDetail?.data?.data?.id,
				documentId: benefitDetail?.data?.data?.documentId,
				title: benefitDetail?.data?.data?.title,
			};
		} catch (error) {
			console.error(
				`Error fetching benefit details for application22:`,
				error.message,
			);
		}

		return { applications, benefit };
	}

	// Get a single application by ID
	async findOne(id: number) {
		const application = await this.prisma.applications.findUnique({
			where: { id },
			include: {
				applicationFiles: true,
			},
		});
		if (!application) {
			throw new NotFoundException('Applications not found');
		}

		// Add base64 file content to each applicationFile
		if (
			application.applicationFiles &&
			Array.isArray(application.applicationFiles)
		) {
			application.applicationFiles = application.applicationFiles.map(
				(file) => {
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
				},
			);
		}

		let benefitDetails;
		try {
			benefitDetails = await this.benefitsService.getBenefitsById(
				`${application.benefitId}`,
			);
		} catch (error) {
			console.error(
				`Error fetching benefit details for application22:`,
				error.message,
			);
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
		});
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

	async updateStatus(
		id: number,
		updateStatusDto: UpdateApplicationStatusDto,
		actionLog: UpdateApplicationActionLogDto,
	) {
		const application = await this.prisma.applications.findUnique({
			where: { id },
		});

		if (!application) {
			throw new NotFoundException(`Application with ID ${id} not found`);
		}

		if (application.actionLog && Array.isArray(application.actionLog)) {
			application.actionLog.push(
				this.getActionLogEntry(
					actionLog,
					updateStatusDto.status,
					updateStatusDto.remark,
				),
			);
		} else {
			application.actionLog = [
				this.getActionLogEntry(
					actionLog,
					updateStatusDto.status,
					updateStatusDto.remark,
				),
			];
		}

		const updatedApplication = await this.prisma.applications.update({
			where: { id },
			data: {
				...updateStatusDto,
				updatedBy: actionLog.updatedBy,
				actionLog: application.actionLog,
			},
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

	getActionLogEntry(
		actionLog: UpdateApplicationActionLogDto,
		status: string,
		remark: string,
	) {
		return JSON.stringify({
			...actionLog,
			status,
			remark,
		});
	}

	async exportApplicationsCsv(
		benefitId: string,
		reportType: string,
	): Promise<string> {
		const reportConfig = reportsConfig[reportType];
		if (!reportConfig) {
			throw new BadRequestException('Invalid report type');
		}

		const {
			autoGenerateFields = [],
			applicationDataColumnDataFields = [],
			calculatedAmountColumnDataFields = [],
			applicationTableDataFields = [],
		} = reportConfig;

		const applications = await this.fetchApplications(benefitId);

		const finalAppDataFields = this.resolveDynamicFields(
			applications,
			applicationDataColumnDataFields,
			'applicationData',
		);

		const finalCalcAmountFields = this.resolveDynamicFields(
			applications,
			calculatedAmountColumnDataFields,
			'calculatedAmount',
			['totalPayout'],
		);

		const headerFields = [
			...autoGenerateFields,
			...finalAppDataFields,
			...finalCalcAmountFields,
			...applicationTableDataFields,
		];

		const csvRows = [headerFields.join(',')];

		for (const [index, app] of applications.entries()) {
			const row = [
				...this.generateAutoFields(autoGenerateFields, index),
				...this.generateAppDataFields(app, finalAppDataFields),
				...this.generateCalcAmountFields(app, finalCalcAmountFields),
				...this.generateAppTableFields(app, applicationTableDataFields),
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
			throw new BadRequestException(
				`Failed to fetch applications: ${error.message}`,
			);
		}
	}

	private resolveDynamicFields(
		apps: any[],
		fields: string[],
		source: 'applicationData' | 'calculatedAmount',
		excludeFields: string[] = [],
	): string[] {
		if (!Array.isArray(fields)) return [];

		const isWildcard = fields.length === 1 && fields[0] === '*';

		const keySet = new Set<string>();
		for (const app of apps) {
			const sourceData = app[source];
			if (sourceData && typeof sourceData === 'object') {
				Object.keys(sourceData).forEach((key) => {
					if (!excludeFields.includes(key)) {
						keySet.add(key);
					}
				});
			}
		}

		if (isWildcard) {
			return Array.from(keySet).sort((a, b) => a.localeCompare(b));
		}

		return fields.filter((field) => !excludeFields.includes(field));
	}

	private generateAutoFields(
		fields: string[],
		index: number,
	): (string | number)[] {
		return fields.map((field) => (field === 'serialNumber' ? index + 1 : ''));
	}

	private generateAppDataFields(app: any, fields: string[]): string[] {
		return fields.map((field) => {
			if (field === 'otr') return app.applicationData?.nspOtr ?? '';
			if (field === 'aadhaar')
				return app.applicationData?.aadhaar?.slice(-4) ?? '';
			return app.applicationData?.[field] ?? '';
		});
	}

	private generateCalcAmountFields(app: any, fields: string[]): any[] {
		const calcAmountData = app.calculatedAmount ?? {};
		return fields.map((field) => {
			const value = calcAmountData[field];
			return value ?? '';
		});
	}

	private generateAppTableFields(
		app: any,
		fields: string[],
	): (string | number)[] {
		return fields.map((field) => {
			if (field === 'amount') return app.finalAmount ?? '';
			if (field === 'applicationId') return app.id ?? '';
			return app[field] ?? '';
		});
	}

	private escapeCsvRow(row: (string | number)[]): string {
		return row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',');
	}

	// Get a single application by ID
	async calculateBenefit(id: number) {
		const application = await this.prisma.applications.findUnique({
			where: { id },
		});

		if (!application) {
			throw new NotFoundException('Applications not found');
		}

		let benefitDetails;
		try {
			benefitDetails = await this.benefitsService.getBenefitsById(
				`${application.benefitId}`,
			);
		} catch (error) {
			throw new NotFoundException('Benefit not found');
		}

		let amounts;
		amounts = await this.doBenefitCalculations(
			application.applicationData,
			benefitDetails?.data?.data,
		);
		try {
			await this.update(id, {
				calculatedAmount: amounts,
				finalAmount: `${amounts?.totalPayout}`,
				calculationsProcessedAt: new Date(),
			});
		} catch (err) {
			console.error(
				`Error updating benefit details for application: ${id}`,
				err.message,
			);
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
				case 'fixed':
					amount = rule.fixedValue ?? 0;
					break;

				case 'lookup': {
					const inputVal = applicationData[rule.inputFields[0]];
					const found = rule.lookupTable.find(
						(row: any) => row.match === inputVal,
					);
					amount = found ? found.amount : 0;
					break;
				}

				case 'conditional': {
					for (const condition of rule.conditions) {
						const matches = condition.ifExpr
							? this.evaluateIfExpr(condition.ifExpr, applicationData)
							: Object.entries(condition.if).every(
									([k, v]) => applicationData[k] === v,
								);

						if (matches) {
							if (condition.then.amount === 'value') {
								amount = Number(applicationData[rule.inputFields[0]]) || 0;
							} else {
								amount = Number(condition.then.amount) || 0;
							}
							break;
						}
					}
					break;
				}

				case 'formula':
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
				return typeof context[match] !== 'undefined' ? context[match] : '0';
			});

			// Only allow safe characters
			if (!/^[\d\s+\-*/().]+$/.test(safeExpr))
				throw new Error('Unsafe formula');

			return Function(`"use strict"; return (${safeExpr})`)(); // evaluated safely
		} catch (err) {
			console.error('Formula evaluation error:', err.message);
			return 0;
		}
	}

	/**
	 * Limited expression evaluator supporting basic comparison logic.
	 */
	evaluateIfExpr(expr: string, context: ApplicationData): boolean {
		try {
			// Basic parser for comparison operators
			const comparisons = expr.match(
				/([a-zA-Z_][a-zA-Z0-9_]*)\s*([=!<>]+)\s*(true|false|\d+|"[^"]*"|'.*?')/g,
			);

			if (!comparisons) return false;

			return comparisons.every((part) => {
				const [, key, op, rawVal] =
					part.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*([=!<>]+)\s*(.*)/) || [];
				let actual = context[key];
				let expected: any = rawVal;

				if (expected === 'true') expected = true;
				else if (expected === 'false') expected = false;
				else if (!isNaN(Number(expected))) expected = Number(expected);
				else expected = expected.replace(/^['"]|['"]$/g, '');

				switch (op) {
					case '===':
						return actual === expected;
					case '!==':
						return actual !== expected;
					case '>':
						return actual > expected;
					case '<':
						return actual < expected;
					case '>=':
						return actual >= expected;
					case '<=':
						return actual <= expected;
					default:
						return false;
				}
			});
		} catch (err) {
			console.error('Expression evaluation error:', err.message);
			return false;
		}
	}

	async checkEligibility(applicationId: number, req) {
		const application = await this.findOne(applicationId); // Fetch the application by ID

		if (!application) {
			throw new NotFoundException(
				`Application with ID ${applicationId} not found`,
			);
		}

		const benefitDefinition = await this.benefitsService.getBenefitsById(
			`${application.benefitId}`,
		);
		if (!benefitDefinition?.data) {
			throw new NotFoundException(
				`Benefit with ID ${application.benefitId} not found`,
			);
		}
		const strictCheck = req?.query?.strictCheck === 'true';
		const formatEligiblityPayload = await this.formatEligibility(
			benefitDefinition,
			application,
			strictCheck,
		);
		const eligibilityResult = await this.getEligibilityRules(
			formatEligiblityPayload?.applicationDetails,
			formatEligiblityPayload?.eligibilityRules,
			formatEligiblityPayload?.strictCheck,
		);
		let eligibilityStatus = 'ineligible'; // Default status
		if (eligibilityResult?.eligibleUsers?.length > 0) {
			eligibilityStatus = 'eligible'; // Set to eligible if any users are eligible default we sending one application here
		}
		await this.update(applicationId, {
			eligibilityStatus,
			eligibilityResult: eligibilityResult,
			eligibilityCheckedAt: new Date(),
		});

		return eligibilityResult;
	}

	/**
	 * Prepares eligibility rules and application profile, then calls the eligibility API.
	 * Returns the eligibility check result.
	 */
	async formatEligibility(
		benefitDefinition: any,
		application: any,
		strictCheck: boolean,
	) {
		try {
			const eligibilityRules = benefitDefinition?.data?.eligibility ?? [];
			if (Array.isArray(eligibilityRules)) {
				eligibilityRules.forEach((rule) => {
					if (rule && typeof rule === 'object' && 'type' in rule) {
						// Ensure rule is an object with a type
						rule.type = 'userProfile';
					}
				});
				const existingIds = eligibilityRules // Extract existing rule IDs to determine the next ID
					.map((rule) => Number(rule.id))
					.filter((id) => !isNaN(id));
				const nextId =
					existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1; /// Determine the next ID for new rules
				eligibilityRules.push({
					// Add a default rule for document verification
					id: nextId,
					type: 'userProfile',
					description: 'All documents must be verified',
					evidence: 'verification status',
					criteria: {
						id: nextId,
						name: 'documentVerificationStatus',
						condition: 'equals',
						conditionValues: ['verified'],
					},
				});
			}
			const applicationDetails = {
				// Prepare application profile for eligibility check
				applicationId: application?.id,
				...(typeof application?.applicationData === 'object' &&
				application?.applicationData !== null
					? application.applicationData
					: {}),
				documentVerificationStatus: application?.documentVerificationStatus,
			};
			return { applicationDetails, eligibilityRules, strictCheck };
		} catch (err) {
			throw new Error('Error formatting eligibility');
		}
	}

	async getEligibilityRules(
		userInfo: object,
		eligibilityData: Array<any>,
		strictCheck: boolean,
	): Promise<any> {
		try {
			let eligibilityApiEnd = 'check-users-eligibility'; // Default endpoint
			if (strictCheck) {
				eligibilityApiEnd = 'check-users-eligibility?strictChecking=true'; // Use strict checking endpoint
			}
			const eligibilityApiUrl = `${this.eligibility_base_uri}/${eligibilityApiEnd}`;
			const sdkResponse = await this.httpService.axiosRef.post(
				eligibilityApiUrl,
				{
					userProfiles: [userInfo],
					benefitSchema: { eligibility: eligibilityData },
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);
			return sdkResponse.data;
		} catch (error) {
			throw new Error(`Error checking benefits eligibility: ${error.message}`);
		}
	}
}
