import { Injectable } from '@nestjs/common'; // Import Injectable
import { HttpService } from '@nestjs/axios'; // Import HttpService from @nestjs/axios
import { VerifyApplicationVcsResponseDto } from './dtos';
import { PrismaService } from '../prisma.service';
import { promises as fs } from 'fs'; // Import fs.promises

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService // Inject HttpService
  ) {}

  async verifyApplicationVcs(applicationId: string): Promise<VerifyApplicationVcsResponseDto> {
    // Fetch application files for the given applicationId
    const applicationFiles = await this.getApplicationFilesByApplicationId(Number(applicationId));

    console.log('Application Files:', applicationFiles);
    // Use mock file paths if filePath is empty
    const mockFilePaths = [
      './src/verifications/mock-files/file1.json',
      './src/verifications/mock-files/file2.json',
    ];
    applicationFiles.forEach((file, index) => {
      if (!file.filePath) {
        file.filePath = mockFilePaths[index] || '';
      }
    });

    const verificationResults: { filePath: string; isValid: boolean; message: string }[] = [];
    // Read and parse JSON content of each filePath
    for (const file of applicationFiles) {
      if (file.storage === 'local' && file.filePath) {
        try {
          const fileContent = await fs.readFile(file.filePath, 'utf-8');
          const parsedData = JSON.parse(fileContent);
          // console.log('Parsed File Data:', parsedData);

          // Make verify API call
          const apiUrl = process.env.UBI_VERIFICATION_API;
          if (!apiUrl) {
            throw new Error('UBI_VERIFICATION_API is not defined in the environment variables');
          }

          const response = await this.httpService.post(apiUrl, { credential: parsedData }).toPromise();
          if (response && response.data) {
            console.log('Verification API Response:', response.data);

            if (response.data.success) {
              verificationResults.push({
                filePath: file.filePath,
                isValid: true,
                message: response.data.message || 'Credential verified successfully.',
              });

              // Update status in ApplicationFiles table for success
              await this.prisma.applicationFiles.update({
                where: { id: file.id },
                data: {
                  verificationStatus: { status: 'Verified' },
                },
              });
            } else {
              const errorMessages = response.data.errors?.map(err => err.error) || ['Unknown error'];
              verificationResults.push({
                filePath: file.filePath,
                isValid: false,
                message: `${response.data.message || 'Verification failed.'} Errors: ${errorMessages.join(', ')}`,
              });

              // Update status in ApplicationFiles table for failure
              await this.prisma.applicationFiles.update({
                where: { id: file.id },
                data: {
                  verificationStatus:{
                    status: 'Unverified',
                    verificationErrors: errorMessages,
                  },
                },
              });
            }
          } else {
            console.error('Verification API Response is undefined or invalid');
            verificationResults.push({
              filePath: file.filePath,
              isValid: false,
              message: 'Error: Verification API response is undefined or invalid',
            });

            // Update status in ApplicationFiles table for invalid response
            await this.prisma.applicationFiles.update({
              where: { id: file.id },
              data: {
                verificationStatus: {
                  status: 'Unverified',
                  verificationErrors: ['Verification API response is undefined or invalid'],
                },
              },
            });
          }
        } catch (error) {
          console.error(`Error processing file at ${file.filePath}:`, error);
          verificationResults.push({
            filePath: file.filePath,
            isValid: false,
            message: `Error: ${error.message}`,
          });

          // Update status in ApplicationFiles table for processing error
          await this.prisma.applicationFiles.update({
            where: { id: file.id },
            data: {
              verificationStatus: {
                status: 'Unverified',
                verificationErrors: [error.message],
              },
            },
          });
        }
      }
    }

    // Return structured response with individual file statuses
    return {
      applicationId,
      files: verificationResults.map(result => ({
        filePath: result.filePath,
        status: result.isValid ? 'verified' : 'unverified',
        message: result.message,
      })),
    } as any; // Temporary fix using 'as any' to bypass type checking
  }

  async getApplicationFilesByApplicationId(applicationId: number) {
    return this.prisma.applicationFiles.findMany({
      where: { applicationId },
    });
  }
}
