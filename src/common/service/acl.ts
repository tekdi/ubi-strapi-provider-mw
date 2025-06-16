import { Injectable, Inject, forwardRef } from '@nestjs/common';
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
     * Common function to fetch benefit data
     * @param benefitId - The ID of the benefit
     * @returns Object containing benefit data
     */
    private async getBenefitData(benefitId: string, authToken: string, userId: number): Promise<any> {
        try {
            const benefit = await this.benefitsService.getBenefitsByIdStrapi(benefitId, authToken);     
            if (!benefit?.data?.data) {
                return false;
            }
           
            const benefitData = benefit.data.data; 
            
            const loginUser = await this.prisma.users.findUnique({
                where: { id: userId },
            });

            if (!loginUser) {
                return false;
            }

            // Get the organization user details
            const orgUser = await this.prisma.users.findFirst({
                where: { 
                    s_id: benefitData?.createdBy?.id.toString()
                }
            });

            if (!orgUser) {
                return false;
            }

            // Check if login user is super admin
            if (loginUser?.s_roles?.includes('Super Admin')) {
                return true;
            }

            // Compare roles arrays to check if users are from same organization
            const loginUserRoles = loginUser.s_roles ?? [];
            const orgUserRoles = orgUser.s_roles ?? [];
            // Check if there's any common role between the users
            const hasCommonRole = loginUserRoles.some(role => orgUserRoles.includes(role));

            return hasCommonRole;
        } catch (error) {
            console.error('Error fetching benefit data:', error.message);
            return false;
        }
    }

    /**
     * Check if a user can access a specific benefit
     * @param userId - The ID of the user
     * @param benefitId - The ID of the benefit
     * @returns boolean indicating if user has access
     */
    async canAccessBenefit(authToken: string, benefitId: string, userId: number, ): Promise<boolean> {
        

        const benefitData = await this.getBenefitData(benefitId, authToken, userId);
        return benefitData;
    }

    /**
     * Check if a user can access a specific application
     * @param userId - The ID of the user
     * @param applicationId - The ID of the application
     * @returns boolean indicating if user has access
     */
    async canAccessApplication(authToken: string, applicationId: number, userId: number): Promise<boolean> {
        // Check if user owns the application
        const application = await this.prisma.applications.findUnique({
            where: { id: applicationId },
        });

        if (!application) {
            return false;
        }

        // Check if the benefit associated with the application is accessible
        const benefitData = await this.getBenefitData(application.benefitId, authToken, userId);
       
        return benefitData;
    }
}
