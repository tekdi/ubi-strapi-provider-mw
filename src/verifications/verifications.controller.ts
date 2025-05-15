import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { VerifyApplicationVcsRequestDto } from './dtos/verify-application-vcs-request.dto';
import { VerifyApplicationVcsResponseDto } from './dtos/verify-application-vcs-response.dto';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('verify-vcs')
  @ApiOperation({ summary: 'Verify Application VCS' })
  @ApiBody({
    type: VerifyApplicationVcsRequestDto,
    description: 'The application ID to verify',
    examples: {
      default: {
        value: { applicationId: "1" }, // Correctly define the payload structure
      },
    },
  })
  async verifyApplicationVcs(
    @Body() verifyApplicationVcsRequestDto: VerifyApplicationVcsRequestDto
  ): Promise<{
    isSuccess: boolean;
    code: number;
    response: VerifyApplicationVcsResponseDto;
  }> {
    const { applicationId } = verifyApplicationVcsRequestDto;
    return this.verificationService.verifyApplicationVcs(applicationId);
  }
}
