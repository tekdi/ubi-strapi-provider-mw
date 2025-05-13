import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

export const ApplicationFilesApiDocs = {
  create: {
    operation: {
      summary: 'Create a new ApplicationFile',
      description: 'Create a new application file with the provided data.',
    },
    body: {
      description: 'ApplicationFile data',
      schema: {
        example: {
          applicationId: 1,
          fileName: 'identity_proof.pdf',
          fileType: 'application/pdf',
          fileSize: 1024,
          storage: 'local',
          metadata: {
            documentType: 'identity_proof',
            uploadDate: '2024-03-20T10:00:00Z'
          }
        }
      }
    },
    responses: {
      success: {
        status: 201,
        description: 'ApplicationFile created successfully',
        schema: {
          example: {
            id: 1,
            applicationId: 1,
            fileName: 'identity_proof.pdf',
            fileType: 'application/pdf',
            fileSize: 1024,
            storage: 'local',
            metadata: {
              documentType: 'identity_proof',
              uploadDate: '2024-03-20T10:00:00Z'
            },
            createdAt: '2024-03-20T10:00:00Z',
            updatedAt: '2024-03-20T10:00:00Z'
          }
        }
      },
      badRequest: {
        status: 400,
        description: 'Bad Request - Invalid input data'
      }
    }
  },

  findAll: {
    operation: {
      summary: 'Get all ApplicationFiles',
      description: 'Retrieve a list of all application files.',
    },
    responses: {
      success: {
        status: 200,
        description: 'List of ApplicationFiles retrieved successfully',
        schema: {
          example: {
            data: [
              {
                id: 1,
                applicationId: 1,
                fileName: 'identity_proof.pdf',
                fileType: 'application/pdf',
                fileSize: 1024,
                storage: 'local',
                metadata: {
                  documentType: 'identity_proof',
                  uploadDate: '2024-03-20T10:00:00Z'
                },
                createdAt: '2024-03-20T10:00:00Z',
                updatedAt: '2024-03-20T10:00:00Z'
              }
            ],
            total: 1
          }
        }
      }
    }
  },

  findOne: {
    operation: {
      summary: 'Get a single ApplicationFile by ID',
      description: 'Retrieve detailed information about a specific application file.',
    },
    param: {
      name: 'id',
      description: 'ApplicationFile ID',
      example: 1
    },
    responses: {
      success: {
        status: 200,
        description: 'ApplicationFile retrieved successfully',
        schema: {
          example: {
            id: 1,
            applicationId: 1,
            fileName: 'identity_proof.pdf',
            fileType: 'application/pdf',
            fileSize: 1024,
            storage: 'local',
            metadata: {
              documentType: 'identity_proof',
              uploadDate: '2024-03-20T10:00:00Z'
            },
            createdAt: '2024-03-20T10:00:00Z',
            updatedAt: '2024-03-20T10:00:00Z'
          }
        }
      },
      notFound: {
        status: 404,
        description: 'ApplicationFile not found'
      }
    }
  },

  update: {
    operation: {
      summary: 'Update an ApplicationFile by ID',
      description: 'Update the details of an existing application file.',
    },
    param: {
      name: 'id',
      description: 'ApplicationFile ID',
      example: 1
    },
    body: {
      description: 'Updated ApplicationFile data',
      schema: {
        example: {
          fileName: 'updated_identity_proof.pdf',
          metadata: {
            documentType: 'identity_proof',
            uploadDate: '2024-03-20T11:00:00Z',
            verified: true
          }
        }
      }
    },
    responses: {
      success: {
        status: 200,
        description: 'ApplicationFile updated successfully',
        schema: {
          example: {
            id: 1,
            applicationId: 1,
            fileName: 'updated_identity_proof.pdf',
            fileType: 'application/pdf',
            fileSize: 1024,
            storage: 'local',
            metadata: {
              documentType: 'identity_proof',
              uploadDate: '2024-03-20T11:00:00Z',
              verified: true
            },
            createdAt: '2024-03-20T10:00:00Z',
            updatedAt: '2024-03-20T11:00:00Z'
          }
        }
      },
      badRequest: {
        status: 400,
        description: 'Bad Request - Invalid input data'
      },
      notFound: {
        status: 404,
        description: 'ApplicationFile not found'
      }
    }
  }
}; 