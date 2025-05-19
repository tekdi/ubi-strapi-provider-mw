import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { VerifyApplicationVcsResponseDto } from './dtos';
import { PrismaService } from '../prisma.service';
import { promises as fs } from 'fs';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService
  ) { }

  async verifyApplicationVcs(applicationId: string): Promise<{
    isSuccess: boolean;
    code: number;
    response: VerifyApplicationVcsResponseDto;
  }> {
    if (!applicationId) {
      return this.buildResponse(false, 400, 'Application ID is required', applicationId, [], 'unverified');
    }

    const applicationFiles = await this.getApplicationFilesByApplicationId(Number(applicationId));
    if (!applicationFiles || applicationFiles.length === 0) {
      return this.buildResponse(false, 404, 'No application files found for the given application ID', applicationId, [], 'unverified');
    }

    const apiUrl = process.env.VERIFICATION_SERVICE_URL;
    if (!apiUrl) {
      return this.buildResponse(false, 500, 'VERIFICATION_SERVICE_URL is not defined in environment variables', applicationId, [], 'unverified');
    }

    const verificationResults: {
      id: any;
      filePath: string | null;
      isValid: boolean;
      message: string;
    }[] = [];

    for (const file of applicationFiles) {
      if (file.storage === 'local') {
        if (!file.filePath) {
          verificationResults.push({
            id: file.id,
            filePath: null,
            isValid: false,
            message: 'File path is missing for this application file.',
          });

          await this.prisma.applicationFiles.update({
            where: { id: file.id },
            data: {
              verificationStatus: {
                status: 'Unverified',
                verificationErrors: ['File path is missing.'],
              },
            },
          });
          continue;
        }

        try {
          const fileContent = await fs.readFile(file.filePath, 'utf-8');

          // Try to detect if the content is URL-encoded
          let content = fileContent;
          if (fileContent.trim().startsWith('%')) {
            try {
              content = decodeURIComponent(fileContent);
            } catch (decodeError) {
              console.error('Failed to decode URI component:', decodeError);
              throw decodeError;
            }
          }

          let parsedData;
          try {
            parsedData = JSON.parse(content);
          } catch (parseError) {
            console.error('Failed to parse JSON file:', parseError);
            throw parseError;
          }

          const response = await lastValueFrom(
            this.httpService.post(apiUrl, { credential: parsedData })
          );

          const isValid = response?.data?.success ?? false;
          const message = isValid
            ? response.data.message ?? 'Credential verified successfully.'
            : `${response.data.message ?? 'Verification failed.'} Errors: ${(response.data.errors?.map((err: any) => err.error) ?? ['Unknown error']).join(', ')
            }`;

          verificationResults.push({
            id: file.id,
            filePath: file.filePath,
            isValid,
            message,
          });

          await this.prisma.applicationFiles.update({
            where: { id: file.id },
            data: {
              verificationStatus: {
                status: isValid ? 'Verified' : 'Unverified',
                ...(isValid ? {} : {
                  verificationErrors: response.data.errors?.map((err: any) => err.error) ?? ['Unknown error'],
                }),
              },
            },
          });
        } catch (error: any) {
          verificationResults.push({
            id: file.id,
            filePath: file.filePath,
            isValid: false,
            message: `Error: ${error.message}`,
          });

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

    const files: {
      id: any;
      filePath: string | null;
      status: 'verified' | 'unverified';
      message: string;
    }[] = verificationResults.map(result => ({
      id: result.id,
      filePath: result.filePath,
      status: result.isValid ? 'verified' : 'unverified',
      message: result.message,
    }));

    const total = files.length;
    const successCount = files.filter(file => file.status === 'verified').length;
    const allSuccessful = successCount === total;
    const partialSuccess = successCount > 0 && successCount < total;

    const status = allSuccessful
      ? 'verified'
      : partialSuccess
        ? 'partially_verified'
        : 'unverified';

    const code = allSuccessful ? 200 : partialSuccess ? 207 : 422;
    const message = allSuccessful
      ? 'Verification completed successfully'
      : partialSuccess
        ? 'Verification completed with some errors'
        : 'Verification failed';

    return this.buildResponse(allSuccessful, code, message, applicationId, files, status);
  }

  private async getApplicationFilesByApplicationId(applicationId: number) {
    return this.prisma.applicationFiles.findMany({
      where: { applicationId },
    });
  }

  private buildResponse(
    isSuccess: boolean,
    code: number,
    message: string,
    applicationId: string,
    files: { id: any; filePath: string | null; status: 'verified' | 'unverified'; message: string }[],
    status: 'verified' | 'partially_verified' | 'unverified' = 'unverified'
  ) {
    return {
      isSuccess,
      code,
      response: {
        applicationId,
        status,
        message,
        files,
      },
    };
  }
}
