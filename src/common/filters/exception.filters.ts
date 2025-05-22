import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { AxiosError } from 'axios';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly apiId?: string) { }

    catch(
        exception: Error | HttpException | AxiosError,
        host: ArgumentsHost,
    ) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Default status code
        let status = 500;
        let errorMessage : string;

        // Handle HttpException
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            errorMessage = (exception.getResponse() as any)?.message ?? exception.message;
        }

        // Handle file upload error
        else if (exception.message === 'You can only upload up to 10 files at a time.') {
            status = 400;
            errorMessage = exception.message;
        }

        // Handle AxiosError
        else if (exception instanceof AxiosError) {
            status = exception.response?.status ?? 500;
            errorMessage = exception.response?.data ?? exception.message ?? 'AXIOS_ERROR';
        }
        // Handle PrismaClientKnownRequestError
        else if (exception instanceof Prisma.PrismaClientValidationError) {
            status = 400;
            errorMessage = exception.message ?? 'PRISMA_CLIENT_ERROR';
        }
        // Handle PrismaClientUnknownRequestError
        else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
            errorMessage = exception.message ?? 'PRISMA_CLIENT_UNKNOWN_ERROR';
        }
        // Handle PrismaClientInitializationError       
        else if (exception instanceof Prisma.PrismaClientInitializationError) {
            errorMessage = exception.message ?? 'PRISMA_CLIENT_INITIALIZATION_ERROR';
        }
        // Handle other exceptions
        else {
            errorMessage = exception?.message ?? 'INTERNAL_SERVER_ERROR';
        }

        // Log the error
        console.error({
            status,
            errorMessage,
            path: request.url,
            method: request.method,
            timestamp: new Date().toISOString(),
        });

        // Send the response
        return response.status(status).json({
            statusCode: status,
            message: errorMessage,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
