export const AuthApiDocs = {
  login: {
    operation: {
      summary: 'User Login',
      description: 'Authenticate a user and return a JWT token.',
    },
    body: {
      description: 'Login credentials',
      schema: {
        example: {
          email: 'john.doe@example.com',
          password: 'securepassword123'
        }
      }
    },
    responses: {
      success: {
        status: 200,
        description: 'Login successful',
        schema: {
          example: {
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            token_type: 'Bearer',
            expires_in: 3600,
            user: {
              id: 1,
              username: 'john.doe@example.com',
              role: 'provider'
            }
          }
        }
      },
      unauthorized: {
        status: 401,
        description: 'Invalid credentials',
        schema: {
          example: {
            statusCode: 401,
            message: 'Invalid username or password',
            error: 'Unauthorized'
          }
        }
      }
    }
  }
}; 