import { Controller, Post, Body, UseFilters } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { VerifyApplicationVcsRequestDto, VerifyApplicationVcsResponseDto } from './dtos';
import { AllExceptionsFilter } from '../common/filters/exception.filters';

@UseFilters(new AllExceptionsFilter())
@ApiTags('Verifications') // Grouping the endpoints under "Verifications" in Swagger
@Controller('verify')
export class VerificationsController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('/application-vcs')
  @ApiOperation({ summary: 'Verify Verifiable Credentials (VCs) for a specific application' })
  @ApiResponse({
    status: 200,
    description: 'Verification result',
    type: VerifyApplicationVcsResponseDto,
  })
  async verifyApplicationVcs(
    @Body() verifyApplicationVcsRequestDto: VerifyApplicationVcsRequestDto,
  ): Promise<VerifyApplicationVcsResponseDto> {
    return this.verificationService.verifyApplicationVcs(verifyApplicationVcsRequestDto.applicationId);
  }
}
