import { Controller, Get, Post, Body, Param, Patch, UseInterceptors, UploadedFile, UseFilters, UploadedFiles } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage, File } from 'multer';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { ApplicationFilesService } from './applicationFiles.service';
import { CreateApplicationFilesDto } from './dto/create-applicationfiles.dto';
import { AllExceptionsFilter } from 'src/common/filters/exception.filters';
import { extname } from 'path';
import { UpdateApplicationFilesDto } from './dto/update-applicationfiles.dto';

@UseFilters(new AllExceptionsFilter())
@ApiTags('ApplicationFiles')
@Controller('application-files')
export class ApplicationFilesController {
  constructor(private readonly ApplicationFilesService: ApplicationFilesService) { }

  // Create a new ApplicationFile with file upload
  @Post()
  @ApiOperation({ summary: 'Create a new ApplicationFile with file upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file',
    type: CreateApplicationFilesDto,
  })
  @ApiResponse({ status: 201, description: 'ApplicationFile created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads', // Directory where files will be stored
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const files = req.files || [];
        if (files.length >= 10) { // Check if file count exceeds the limit
          return callback(
            new Error('You can only upload up to 10 files at a time.'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @UploadedFiles() files: File[],
    @Body() body: CreateApplicationFilesDto,
  ) {
    const verificationStatus =
      typeof body.verificationStatus === 'string'
        ? JSON.parse(body.verificationStatus) // Parse if it's a string
        : body.verificationStatus || {}; // Use as-is if it's already an object
    const applicationFilesData = files.map((file) => ({
      filePath: file.path, // Store the file path
      storage: 'local', // Default storage type
      verificationStatus, // Store as JSON
      applicationId: Number(body.applicationId), // Convert applicationId to a number
    }));
    return this.ApplicationFilesService.create(applicationFilesData);
  }

  // Get all ApplicationFiles
  @Get()
  @ApiOperation({ summary: 'Get all ApplicationFiles' })
  @ApiResponse({ status: 200, description: 'List of ApplicationFiles retrieved successfully' })
  async findAll() {
    return this.ApplicationFilesService.findAll();
  }

  // Get a single ApplicationFile by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a single ApplicationFile by ID' })
  @ApiParam({ name: 'id', description: 'ApplicationFile ID', type: Number })
  @ApiResponse({ status: 200, description: 'ApplicationFile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'ApplicationFile not found' })
  async findOne(@Param('id') id: string) {
    return this.ApplicationFilesService.findOne(Number(id));
  }

  // Update an ApplicationFile by ID
  @Patch(':id')
  @ApiOperation({ summary: 'Update an ApplicationFile by ID' })
  @ApiParam({ name: 'id', description: 'ApplicationFile ID', type: Number })
  @ApiBody({ description: 'Updated ApplicationFile data', type: UpdateApplicationFilesDto })
  @ApiResponse({ status: 200, description: 'ApplicationFile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'ApplicationFile not found' })
  async update(@Param('id') id: string, @Body() data: UpdateApplicationFilesDto) {
    return this.ApplicationFilesService.update(Number(id), data);
  }
}
