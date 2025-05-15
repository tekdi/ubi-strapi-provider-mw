export class VerifyApplicationVcsResponseDto {
  applicationId: string;
  status: 'verified' | 'partially_verified' | 'unverified';
  message: string;
  files: {
    id: any;
    filePath: string | null;
    status: 'verified' | 'unverified';
    message: string;
  }[];
}