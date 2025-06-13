import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { BenefitsService } from '../../benefits/benefits.service';

@Injectable()
export class AclService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(forwardRef(() => BenefitsService))
        private readonly benefitsService: BenefitsService
    ) {}

    /**
     * Common function to check if a user has admin role
     * @param userId - The ID of the user
     * @returns Object containing user data and admin status
     */
    private async checkUserAccess(userId: number): Promise<{ user: any; isAdmin: boolean }> {
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isAdmin = user.roles?.includes('admin') || user.s_roles?.includes('admin');
        return { user, isAdmin };
    }

    /**
     * Common function to fetch benefit data
     * @param benefitId - The ID of the benefit
     * @returns Object containing benefit data
     */
    private async getBenefitData(benefitId: string, userId: string): Promise<any> {
        try {
            const benefit = await this.benefitsService.getBenefitsByIdStrapi(benefitId, userId);    
            if (!benefit?.data?.data) {
                return null;
            }
           
            const benefitData = benefit.data.data;   
            console.log(benefitData,'======')
            return benefitData?.createdBy;
        } catch (error) {
            console.error('Error fetching benefit data:', error);
            return null;
        }
    }

    /**
     * Check if a user can access a specific benefit
     * @param userId - The ID of the user
     * @param benefitId - The ID of the benefit
     * @returns boolean indicating if user has access
     */
    async canAccessBenefit(userId: string, benefitId: string): Promise<boolean> {
        

        const benefitData = await this.getBenefitData(benefitId, userId);
        if (!benefitData) {
            return false;
        }
       

        // TODO: Add additional benefit access rules here
        // For example, check if user has specific role for this benefit
        // or if user belongs to a group that has access to this benefit

        return true;
    }

    /**
     * Check if a user can access a specific application
     * @param userId - The ID of the user
     * @param applicationId - The ID of the application
     * @returns boolean indicating if user has access
     */
    async canAccessApplication(userId: string, applicationId: number): Promise<boolean> {
        

        // Check if user owns the application
        const application = await this.prisma.applications.findUnique({
            where: { id: applicationId },
        });

        if (!application) {
            return false;
        }

        // Check if the benefit associated with the application is accessible
        const benefitData = await this.getBenefitData(application.benefitId, userId);
        console.log('Full benefit response:', JSON.stringify(benefitData));
        return benefitData !== null;
    }
}
