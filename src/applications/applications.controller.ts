import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Patch,
	Query,
	UseFilters,
	UsePipes,
	ValidationPipe,
	UseGuards,
	Req,
	BadRequestException,
	Res,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
	ApiBasicAuth,
	ApiQuery,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { ApplicationsService } from './applications.service';
import { CreateApplicationsDto } from './dto/create-applications.dto';
import { UpdateApplicationsDto } from './dto/update-applications.dto';
import { AllExceptionsFilter } from 'src/common/filters/exception.filters';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ListApplicationsDto } from './dto/list-applications.dto';
import { ApplicationStatusValidationPipe } from './pipes/application-status-validation.pipe';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApplicationsApiDocs } from '../docs';
import { CsvExportApplicationsDto } from './dto/csvexport-applications.dto';
import { CsvExportEligibilityDto } from './dto/eligibility-csv-dto';
import { getAuthToken, getBrowserInfo } from 'src/common/util';

@UseFilters(new AllExceptionsFilter())
@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
	constructor(private readonly applicationsService: ApplicationsService) {}

	@Post()
	@ApiOperation(ApplicationsApiDocs.create.operation)
	@ApiBody(ApplicationsApiDocs.create.body)
	@ApiResponse(ApplicationsApiDocs.create.responses.success)
	@ApiResponse(ApplicationsApiDocs.create.responses.badRequest)
	async create(@Body() data: CreateApplicationsDto) {
		try {
			// Validate that vc_documents is provided as an array (can be empty)
			if (!data.vc_documents || !Array.isArray(data.vc_documents)) {
				throw new BadRequestException(
					'vc_documents must be provided as an array (can be empty)'
				);
			}

			// Validate each VC document if any are provided
			for (const [index, doc] of data.vc_documents.entries()) {
				if (!doc.document_content?.startsWith('base64,')) {
					throw new BadRequestException(
						`vc_documents[${index}]: document_content must be provided and start with "base64,"`
					);
				}
				if (!doc.document_type || !doc.document_subtype) {
					throw new BadRequestException(
						`vc_documents[${index}]: document_type and document_subtype are required`
					);
				}
				
				// Handle document_submission_reason as either array or JSON string
				let submissionReasons: string[] = [];
				if (typeof doc.document_submission_reason === 'string') {
					try {
						submissionReasons = JSON.parse(doc.document_submission_reason);
					} catch (error) {
						throw new BadRequestException(
							`vc_documents[${index}]: document_submission_reason must be a valid JSON array or array`
						);
					}
				} else if (Array.isArray(doc.document_submission_reason)) {
					submissionReasons = doc.document_submission_reason;
				}
				
				if (!Array.isArray(submissionReasons) || submissionReasons.length === 0) {
					throw new BadRequestException(
						`vc_documents[${index}]: document_submission_reason must be a non-empty array`
					);
				}
				
				// Store the parsed array back to the document for consistent processing
				doc.document_submission_reason = submissionReasons;
			}

		return this.applicationsService.create(data);
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException(
				`Failed to create application: ${error.message}`
			);
		}
	}

  @Get()
  @ApiBasicAuth('access-token')
  @UseGuards(AuthGuard)
  @ApiOperation(ApplicationsApiDocs.findAll.operation)
  @ApiResponse(ApplicationsApiDocs.findAll.responses.success)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async findAll(@Query() listDto: ListApplicationsDto, @Req() req: Request) {
    return this.applicationsService.findAll(listDto, req);
  }

  @Get(':id')
  @ApiBasicAuth('access-token')
  @UseGuards(AuthGuard)
  @ApiOperation(ApplicationsApiDocs.findOne.operation)
  @ApiParam(ApplicationsApiDocs.findOne.param)
  @ApiResponse(ApplicationsApiDocs.findOne.responses.success)
  @ApiResponse(ApplicationsApiDocs.findOne.responses.notFound)
  async findOne(@Param('id') id: string, @Req() req: Request) {
    return this.applicationsService.findOne(Number(id), req);
  }

	@Patch(':id')
	@ApiBasicAuth('access-token')
	@UseGuards(AuthGuard)
	@ApiOperation(ApplicationsApiDocs.update.operation)
	@ApiParam(ApplicationsApiDocs.update.param)
	@ApiBody(ApplicationsApiDocs.update.body)
	@ApiResponse(ApplicationsApiDocs.update.responses.success)
	@ApiResponse(ApplicationsApiDocs.update.responses.badRequest)
	@ApiResponse(ApplicationsApiDocs.update.responses.notFound)
	async update(@Param('id') id: string, @Body() data: UpdateApplicationsDto) {
		return this.applicationsService.update(
			Number(id),
			data as Prisma.ApplicationsUpdateInput,
		);
	}

	@Patch(':id/status')
	@ApiBasicAuth('access-token')
	@UseGuards(AuthGuard)
	@ApiOperation(ApplicationsApiDocs.updateStatus.operation)
	@ApiParam(ApplicationsApiDocs.updateStatus.param)
	@ApiBody(ApplicationsApiDocs.updateStatus.body)
	@ApiResponse(ApplicationsApiDocs.updateStatus.responses.success)
	@ApiResponse(ApplicationsApiDocs.updateStatus.responses.badRequest)
	async updateStatus(
		@Param('id') id: string,
		@Body(new ApplicationStatusValidationPipe())
		updateStatusDto: UpdateApplicationStatusDto,
		@Req() req: Request,
	) {
		const updatedByRaw = req.mw_userid;
		if (!updatedByRaw) {
			throw new BadRequestException('updatedBy header missing');
		}
		const updatedBy = Number(updatedByRaw);
		if (Number.isNaN(updatedBy)) {
			throw new BadRequestException('updatedBy must be numeric');
		}

		// Parse x-forwarded-for header, handling both string and array cases
		const forwardedFor = req.headers['x-forwarded-for'];
		let ip = '';
		if (Array.isArray(forwardedFor)) {
			ip = forwardedFor[0];
		} else if (typeof forwardedFor === 'string') {
			// Split on comma and take first IP if it's a comma-separated list
			ip = forwardedFor.split(',')[0].trim();
		}
		// Fallback to remote address if no forwarded IP
		if (!ip) {
			ip = req.socket.remoteAddress ?? '';
		}

		const userAgent = req.headers['user-agent'] ?? '';
		const { os, browser } = getBrowserInfo(userAgent);
		return this.applicationsService.updateStatus(Number(id), updateStatusDto, {
			os,
			browser,
			updatedBy,
			ip,
			updatedAt: new Date(),
		});
	}

	@Get('/reports/csvexport')
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	@ApiBasicAuth('access-token')
	@UseGuards(AuthGuard)
	@ApiOperation({
		summary: 'Export applications as CSV',
		description:
			'Exports applications for a given benefitId and report type as a CSV file.',
	})
	@ApiQuery({ name: 'benefitId', type: String, required: true })
	@ApiQuery({ name: 'type', type: String, required: true })
	@ApiResponse({
		status: 200,
		description: 'CSV file with applications data',
		schema: { type: 'string', format: 'binary' },
	})
	@ApiResponse({ status: 400, description: 'Missing or invalid parameters' })
	async csvexport(
		@Query() dto: CsvExportApplicationsDto,
		@Res() res: Response,
	) {
		try {
			const csv = await this.applicationsService.exportApplicationsCsv(
				dto.benefitId,
				dto.type,
			);

			res.setHeader('Content-Type', 'text/csv');
			res.setHeader(
				'Content-Disposition',
				`attachment; filename="${dto.type}_applications.csv"`,
			);
			res.send(csv);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Get('calculate-benefit/:id')
	@ApiBasicAuth('access-token')
	@UseGuards(AuthGuard)
	@ApiOperation(ApplicationsApiDocs.calculateBenefit.operation)
	@ApiParam(ApplicationsApiDocs.calculateBenefit.param)
	@ApiResponse(ApplicationsApiDocs.calculateBenefit.responses.success)
	@ApiResponse(ApplicationsApiDocs.calculateBenefit.responses.notFound)
	async calculateBenefit(@Param('id') id: string, @Req() req: Request) {
		const authToken = getAuthToken(req);
		 // auth token is required for the benefit calculation as method is called from cron job
		return this.applicationsService.calculateBenefit(Number(id), authToken);
	}

	@Get('check-eligibility/:id')
	@ApiBasicAuth('access-token')
	@UseGuards(AuthGuard)
	async isEligible(@Param('id') id: string, @Req() req: Request) {
		return this.applicationsService.checkEligibility(Number(id), req);
	}


	@Get('/reports/eligibility/csvexport')
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	@ApiBasicAuth('access-token')
	@UseGuards(AuthGuard)
	@ApiOperation({
		summary: 'Export eligibility report as CSV',
		description:
			'Exports eligibility report for a given report type as a CSV file.',
	})
	@ApiQuery({ name: 'benefitId', type: String, required: true })
	@ApiQuery({ name: 'type', type: String, required: true })
	@ApiResponse({
		status: 200,
		description: 'CSV file with eligibility data',
		schema: { type: 'string', format: 'binary' },
	})
	@ApiResponse({ status: 400, description: 'Missing or invalid parameters' })
	async eligibilitycsvexport(
		@Query() dto: CsvExportEligibilityDto,
		@Res() res: Response,
	) {
		try {
			const csv = await this.applicationsService.exportEligibilityDetailsCsv(
				dto.benefitId,
				dto.type,
			);

			res.setHeader('Content-Type', 'text/csv');
			res.setHeader(
				'Content-Disposition',
				`attachment; filename=eligibility-${dto.type}.csv`,
			);
			res.send(csv);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}
