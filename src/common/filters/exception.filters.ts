import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    Logger
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { AxiosError } from 'axios';

interface ErrorResponse {
    statusCode: number;
    message: string;
    timestamp: string;
    path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);
    private readonly isProduction = process.env.NODE_ENV === 'production';

    constructor(private readonly apiId?: string) { }

    private getSanitizedErrorResponse(
        status: number,
        errorMessage: string,
        request: Request,
    ): ErrorResponse {
        return {
            statusCode: status,
            message: this.isProduction ? this.getSanitizedMessage(status, errorMessage) : errorMessage,
            timestamp: new Date().toISOString(),
            path: request.url,
        };
    }

    private getSanitizedMessage(status: number, errorMessage: string): string {
        // Map common error messages to generic ones in production
        const errorMap: Record<number, string> = {
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            500: 'Internal Server Error',
        };

        return errorMap[status] || 'An unexpected error occurred';
    }

    private logError(
        exception: Error | HttpException | AxiosError,
        status: number,
        request: Request,
    ): void {
        const errorDetails = {
            status,
            error: exception.message,
            stack: this.isProduction ? undefined : exception.stack,
            path: request.url,
            method: request.method,
            timestamp: new Date().toISOString(),
        };

        this.logger.error(errorDetails);
    }

    catch(
        exception: Error | HttpException | AxiosError,
        host: ArgumentsHost,
    ) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Default status code
        let status = 500;
        let errorMessage: string;

        // Handle HttpException
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            errorMessage = (exception.getResponse() as any)?.message ?? exception.message;
        }
        // Handle AxiosError
        else if (exception instanceof AxiosError) {
            status = exception.response?.status ?? 500;
            errorMessage = exception.response?.data ?? exception.message ?? 'AXIOS_ERROR';
        }
        // Handle PrismaClientValidationError
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

        // Log the error with appropriate detail level
        this.logError(exception, status, request);

        // Send sanitized response
        const errorResponse = this.getSanitizedErrorResponse(status, errorMessage, request);
        return response.status(status).json(errorResponse);
    }
}
