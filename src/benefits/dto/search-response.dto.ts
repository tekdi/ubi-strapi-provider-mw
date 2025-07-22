import { IsString, IsOptional, IsArray, IsBoolean, ValidateNested, IsNumber, IsDateString, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// Base descriptor DTO
export class DescriptorDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  short_desc?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

// Location DTOs
export class CityDto {
  @ApiProperty({ example: 'Bangalore' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'std:080' })
  @IsString()
  code: string;
}

export class CountryDto {
  @ApiProperty({ example: 'India' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'IND' })
  @IsString()
  code: string;
}

export class StateDto {
  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'MH' })
  @IsString()
  code: string;
}

export class LocationDto {
  @ApiProperty({ required: false, type: CityDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CityDto)
  city?: CityDto;

  @ApiProperty({ required: false, type: CountryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CountryDto)
  country?: CountryDto;

  @ApiProperty({ required: false, type: StateDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => StateDto)
  state?: StateDto;
}

// Context DTO
export class ContextDto {
  @ApiProperty({ example: 'onest:financial-support' })
  @IsString()
  domain: string;

  @ApiProperty({ example: 'on_search' })
  @IsString()
  action: string;

  @ApiProperty({ example: '1.1.0' })
  @IsString()
  version: string;

  @ApiProperty({ example: 'dev-uba-bap.tekdinext.com' })
  @IsString()
  bap_id: string;

  @ApiProperty({ example: 'https://dev-uba-bap.tekdinext.com' })
  @IsString()
  bap_uri: string;

  @ApiProperty({ example: 'dev-uba-bpp.tekdinext.com' })
  @IsString()
  bpp_id: string;

  @ApiProperty({ example: 'https://dev-uba-bpp.tekdinext.com' })
  @IsString()
  bpp_uri: string;

  @ApiProperty({ example: '26fef807-5bea-4d32-9769-4236e82c9311' })
  @IsString()
  transaction_id: string;

  @ApiProperty({ example: '8d76e5ee-34f1-4b9f-a018-6a82a63f04d2' })
  @IsString()
  message_id: string;

  @ApiProperty({ example: '2025-07-22T17:02:28.442Z' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ example: 'PT10M' })
  @IsString()
  ttl: string;

  @ApiProperty({ required: false, type: LocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}

// Price DTO
export class PriceDto {
  @ApiProperty({ example: 'INR' })
  @IsString()
  currency: string;

  @ApiProperty({ example: '0' })
  @IsString()
  value: string;
}

// Time range DTO
export class TimeRangeDto {
  @ApiProperty({ example: '2025-06-01T00:00:00.000Z' })
  @IsDateString()
  start: string;

  @ApiProperty({ example: '2025-10-31T00:00:00.000Z' })
  @IsDateString()
  end: string;
}

export class TimeDto {
  @ApiProperty({ type: TimeRangeDto })
  @ValidateNested()
  @Type(() => TimeRangeDto)
  range: TimeRangeDto;
}

// Eligibility Criteria DTOs
export class EligibilityCriteriaDto {
  @ApiProperty({ example: 33 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'disabilityType' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'in' })
  @IsString()
  condition: string;

  @ApiProperty({ example: ['acid_attack_victim', 'autism_spectrum_disorder'] })
  @IsArray()
  @IsString({ each: true })
  conditionValues: string[];
}

export class EligibilityEvidenceDto {
  @ApiProperty({ example: 33 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'disabilityType' })
  @IsString()
  evidence: string;

  @ApiProperty({ example: 'health' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'The applicant must have disability type as certified by competent medical authority' })
  @IsString()
  description: string;

  @ApiProperty({ example: ['disabilityCertificate'] })
  @IsArray()
  @IsString({ each: true })
  allowedProofs: string[];

  @ApiProperty({ type: EligibilityCriteriaDto })
  @ValidateNested()
  @Type(() => EligibilityCriteriaDto)
  criteria: EligibilityCriteriaDto;
}

// Document Requirement DTO
export class DocumentRequirementDto {
  @ApiProperty({ example: 49 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'idProof' })
  @IsString()
  documentType: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isRequired: boolean;

  @ApiProperty({ example: ['otrCertificate'] })
  @IsArray()
  @IsString({ each: true })
  allowedProofs: string[];
}

// Benefit DTOs
export class FinancialBenefitDto {
  @ApiProperty({ example: 'benefit.financial-benefit' })
  @IsString()
  __component: string;

  @ApiProperty({ example: 4 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'Free mobility and other aids' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'non-monetary' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'The ADIP Scheme provides free or subsidised modern aids...' })
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description_md?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minValue?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxValue?: number;
}

export class NonMonetaryBenefitDto {
  @ApiProperty({ example: 'benefit.non-monetary-benefit' })
  @IsString()
  __component: string;

  @ApiProperty({ example: 4 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'Free mobility and other aids' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'non-monetary' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'The ADIP Scheme provides free or subsidised modern aids...' })
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description_md?: string;
}

// Exclusion DTO
export class ExclusionDto {
  @ApiProperty({ example: 24 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'Sibling Restriction - Max 2 siblings eligible (both if twins)' })
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description_md?: string;
}

// Address and Contact DTOs
export class AddressDto {
  @ApiProperty({ example: 24 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: '5th Floor, Antyodaya Bhawan, CGO Complex, Lodhi Road' })
  @IsString()
  street: string;

  @ApiProperty({ example: 'New Delhi' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Delhi' })
  @IsString()
  state: string;

  @ApiProperty({ example: '110003' })
  @IsString()
  postalCode: string;
}

export class ContactInfoDto {
  @ApiProperty({ example: 24 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: '24365019' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: 'depwd@gov.in' })
  @IsString()
  email: string;
}

// Sponsoring Entity DTO
export class SponsoringEntityDto {
  @ApiProperty({ example: 12 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'Ministry of Social Justice and Empowerment' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'government' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'Department of Empowerment of Persons with Disabilities (DEPwD)' })
  @IsString()
  department: string;

  @ApiProperty({ example: '100' })
  @IsString()
  sponsorShare: string;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({ type: ContactInfoDto })
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo: ContactInfoDto;
}

// Form Option DTO
export class FormOptionDto {
  @ApiProperty({ example: 252 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'Male' })
  @IsString()
  label: string;

  @ApiProperty({ example: 'male' })
  @IsString()
  value: string;
}

// Application Form Field DTO
export class ApplicationFormFieldDto {
  @ApiProperty({ example: 189 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'firstName' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'text' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'First Name' })
  @IsString()
  label: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  required: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  multiple?: boolean;

  @ApiProperty({ type: [FormOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormOptionDto)
  options: FormOptionDto[];
}

// Tag List Item DTO with JSON value parsing
export class TagListItemDto {
  @ApiProperty({ type: DescriptorDto })
  @ValidateNested()
  @Type(() => DescriptorDto)
  descriptor: DescriptorDto;

  @ApiProperty({ example: '{"id":33,"evidence":"disabilityType",...}' })
  @IsString()
  value: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  display: boolean;
}

// Tag DTO
export class TagDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  display: boolean;

  @ApiProperty({ type: DescriptorDto })
  @ValidateNested()
  @Type(() => DescriptorDto)
  descriptor: DescriptorDto;

  @ApiProperty({ type: [TagListItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagListItemDto)
  list: TagListItemDto[];
}

// Item DTO
export class ItemDto {
  @ApiProperty({ example: 'u1cfo1n5ysbwuk63nz70gro2' })
  @IsString()
  id: string;

  @ApiProperty({ type: DescriptorDto })
  @ValidateNested()
  @Type(() => DescriptorDto)
  descriptor: DescriptorDto;

  @ApiProperty({ type: PriceDto })
  @ValidateNested()
  @Type(() => PriceDto)
  price: PriceDto;

  @ApiProperty({ type: TimeDto })
  @ValidateNested()
  @Type(() => TimeDto)
  time: TimeDto;

  @ApiProperty({ example: false })
  @IsBoolean()
  rateable: boolean;

  @ApiProperty({ type: [TagDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  tags: TagDto[];
}

// Category DTO
export class CategoryDto {
  @ApiProperty({ example: 'CAT_SCHOLARSHIP' })
  @IsString()
  id: string;

  @ApiProperty({ type: DescriptorDto })
  @ValidateNested()
  @Type(() => DescriptorDto)
  descriptor: DescriptorDto;
}

// Fulfillment DTO
export class FulfillmentDto {
  @ApiProperty({ example: 'FULFILL_UNIFIED' })
  @IsString()
  id: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  tracking: boolean;
}

// Provider Location DTO
export class ProviderLocationDto {
  @ApiProperty({ example: 'L1' })
  @IsString()
  id: string;

  @ApiProperty({ type: CityDto })
  @ValidateNested()
  @Type(() => CityDto)
  city: CityDto;

  @ApiProperty({ type: StateDto })
  @ValidateNested()
  @Type(() => StateDto)
  state: StateDto;
}

// Provider DTO
export class ProviderDto {
  @ApiProperty({ example: 'PROVIDER_UNIFIED' })
  @IsString()
  id: string;

  @ApiProperty({ type: DescriptorDto })
  @ValidateNested()
  @Type(() => DescriptorDto)
  descriptor: DescriptorDto;

  @ApiProperty({ type: [CategoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories: CategoryDto[];

  @ApiProperty({ type: [FulfillmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FulfillmentDto)
  fulfillments: FulfillmentDto[];

  @ApiProperty({ type: [ProviderLocationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProviderLocationDto)
  locations: ProviderLocationDto[];

  @ApiProperty({ type: [ItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
}

// Catalog Descriptor DTO
export class CatalogDescriptorDto {
  @ApiProperty({ example: 'Protean DSEP Scholarships and Grants BPP Platform' })
  @IsString()
  name: string;
}

// Catalog DTO
export class CatalogDto {
  @ApiProperty({ type: CatalogDescriptorDto })
  @ValidateNested()
  @Type(() => CatalogDescriptorDto)
  descriptor: CatalogDescriptorDto;

  @ApiProperty({ type: [ProviderDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProviderDto)
  providers: ProviderDto[];
}

// Message DTO
export class MessageDto {
  @ApiProperty({ type: CatalogDto })
  @ValidateNested()
  @Type(() => CatalogDto)
  catalog: CatalogDto;
}

// Main Response DTO
export class SearchResponseDto {
  @ApiProperty({ type: ContextDto })
  @ValidateNested()
  @Type(() => ContextDto)
  context: ContextDto;

  @ApiProperty({ type: MessageDto })
  @ValidateNested()
  @Type(() => MessageDto)
  message: MessageDto;
}

// Utility types for parsing JSON values in tags
export type ParsedEligibilityEvidence = EligibilityEvidenceDto;
export type ParsedDocumentRequirement = DocumentRequirementDto;
export type ParsedBenefit = FinancialBenefitDto | NonMonetaryBenefitDto;
export type ParsedExclusion = ExclusionDto;
export type ParsedSponsoringEntity = SponsoringEntityDto;
export type ParsedApplicationFormField = ApplicationFormFieldDto; 