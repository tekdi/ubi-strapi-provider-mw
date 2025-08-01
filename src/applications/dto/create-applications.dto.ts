import { 
  IsString, 
  IsNotEmpty, 
  IsObject, 
  IsOptional, 
  IsArray, 
  ValidateNested
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// VC Document structure interface
export class VcDocumentDto {
  @ApiProperty({
    description: 'Array of reasons for document submission',
    example: ['disabilityType', 'disabilityRange']
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'document_submission_reason cannot be empty' })
  document_submission_reason: string[];

  @ApiProperty({
    description: 'Document subtype classification',
    example: 'disabilityCertificate'
  })
  @IsString()
  @IsNotEmpty()
  document_subtype: string;

  @ApiProperty({
    description: 'Primary document category',
    example: 'disabilityProof'
  })
  @IsString()
  @IsNotEmpty()
  document_type: string;

  @ApiProperty({
    description: 'Base64 encoded document content',
    example: 'base64,JTdC...'
  })
  @IsString()
  @IsNotEmpty()
  document_content: string;
}

export class CreateApplicationsDto {
  // Essential required fields
  @ApiProperty({
    description: 'The unique benefit ID for the application',
    example: 'BENEFIT123',
  })
  @IsString()
  @IsNotEmpty()
  benefitId: string;

  @ApiPropertyOptional({
    description: 'The status of the application',
    example: 'pending',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Additional application data in JSON format (for backward compatibility)',
    example: { key: 'value' },
  })
  @IsOptional()
  @IsObject()
  applicationData?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Customer ID', example: 'CUST123' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'BAP ID', example: 'BAP456' })
  @IsOptional()
  @IsString()
  bapId?: string;

  @ApiPropertyOptional({ description: 'Order ID', example: 'TXPLS2345' })
  @IsOptional()
  @IsString()
  orderId?: string;

  // VC Documents array - required array that can be empty
  @ApiProperty({
    description: 'Array of VC documents with metadata (can be empty array)',
    type: [VcDocumentDto],
    example: []
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VcDocumentDto)
  vc_documents: VcDocumentDto[];

  // Metadata fields
  @ApiPropertyOptional({ description: 'OS information', example: 'Windows 10' })
  @IsOptional()
  @IsString()
  os?: string;

  @ApiPropertyOptional({ description: 'Browser information', example: 'Chrome' })
  @IsOptional()
  @IsString()
  browser?: string;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: '1' })
  @IsOptional()
  updatedBy?: number|string;

  @ApiPropertyOptional({ description: 'IP address', example: '203.0.113.1' })
  @IsOptional()
  @IsString()
  ip?: string;
}
