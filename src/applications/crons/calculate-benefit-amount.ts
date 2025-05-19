import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { Prisma, ApplicationFiles } from '@prisma/client';
import { PrismaService } from '../../prisma.service'; // Your custom Prisma service
import { ConfigService } from '@nestjs/config';
import { ApplicationsService } from '../applications.service';
import { CronJob } from 'cron';
@Injectable()
export class ApplicationStatusUpdate {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly applicationsService: ApplicationsService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) { }
    onModuleInit() {
        const cronExpression = this.configService.get('BENEFITS_CALCULATION_CRON_RUN_TIME') || '0 0 * * * *';; // fallback to every second
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
            this.configService.get('BENEFITS_CALCULATION_LAST_PROCESS_HOURS'),
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
                AND ("processedAt" IS NULL OR "processedAt" <= ${filterTimestamp}::timestamp)
            LIMIT ${this.configService.get('BENEFITS_BATCH_NUM')}::bigint OFFSET 0
            `;
    }

    private async processApplications(applications: any[]) {
        for (const app of applications) {
            try {
                const response = await this.applicationsService.calculateBenefit(Number(app.id))
            } catch (err) {
                Logger.warn(`Failed to update application ${app.id}: ${err.message}`);
            }
        }
    }
}
