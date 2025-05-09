import { Injectable } from '@nestjs/common';
import { VerifyApplicationVcsResponseDto } from './dtos';
import { PrismaService } from '../prisma.service';

@Injectable()
export class VerificationService {
  async verifyApplicationVcs(applicationId: string): Promise<VerifyApplicationVcsResponseDto> {
    // Fetch application files for the given applicationId
    const applicationFiles = await this.getApplicationFilesByApplicationId(Number(applicationId));

    console.log('Application Files:', applicationFiles);
    // Perform verification logic based on application files
    const isVerified = applicationFiles.length > 0; // Replace with actual verification logic

    // Return structured response
    return {
      applicationId,
      status: isVerified ? 'verified' : 'unverified',
      verifiedCredentials: isVerified ? applicationFiles.map(file => file.filePath || '') : [],
      message: isVerified ? 'Verification successful' : 'Verification failed',
    };
  }
  constructor(private readonly prisma: PrismaService) {}

  async getApplicationFilesByApplicationId(applicationId: number) {
    return this.prisma.applicationFiles.findMany({
      where: { applicationId },
    });
  }
}
