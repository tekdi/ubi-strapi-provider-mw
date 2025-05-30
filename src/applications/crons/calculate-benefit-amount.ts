import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { ConfigService } from '@nestjs/config';
import { ApplicationsService } from '../applications.service';
import { CronJob } from 'cron';
@Injectable()
export class ApplicationStatusUpdate {
    private readonly strapiToken: string | undefined;
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly applicationsService: ApplicationsService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {
        this.strapiToken = this.configService.get('STRAPI_TOKEN');
        if (!this.strapiToken) {
            throw new Error('STRAPI_TOKEN is not defined in the configuration');
        }
    }
    onModuleInit() {
        const cronExpression = this.configService.get('BENEFIT_CALCULATIONS_CRON_TIME') ?? '*/30 * * * *';
        const job = new CronJob(cronExpression, () => this.updateApplicationStatusCron());

        this.schedulerRegistry.addCronJob('application-status-update', job);
        job.start();
    }
    private async updateApplicationStatusCron() {
        try {
            const applications = await this.getApplications();
            await this.processApplications(applications);
        } catch (error) {
            Logger.error(`Error in 'benefit calculation cron': ${error.message}`, error.stack);
        }
    }

    async getApplications() {
        let dt = new Date();
        let BENEFITS_CALCULATION_LAST_PROCESS_HOURS = Number(
            this.configService.get('BENEFIT_CALCULATIONS_LAST_PROCESS_HOURS') ?? 24,
        );
        let filterTimestamp = new Date(
            dt.setHours(dt.getHours() - BENEFITS_CALCULATION_LAST_PROCESS_HOURS),
        ).toISOString();
        return this.prisma.$queryRaw<
            Array<{ id: number; }>
        >`
            SELECT id
            FROM "Applications"
            WHERE "calculatedAmount" IS NULL
                AND ("calculationsProcessedAt" IS NULL OR "calculationsProcessedAt" <= ${filterTimestamp}::timestamp)
            LIMIT ${this.configService.get('BENEFIT_CALCULATIONS_BATCH_SIZE') ?? 10}::bigint OFFSET 0
            `;
    }
    private async processApplications(applications: any[]) {
        for (const app of applications) {
            try {
                await this.applicationsService.calculateBenefit(Number(app.id), `Bearer ${this.strapiToken}`)
            } catch (err) {
                Logger.warn(`Failed to update application ${app.id}: ${err.message}`);
            }
        }
    }
}