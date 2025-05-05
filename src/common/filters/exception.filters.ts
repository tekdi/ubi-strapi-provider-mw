import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
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
        let errorMessage = 'INTERNAL_SERVER_ERROR';

        // Handle HttpException
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            errorMessage = (exception.getResponse() as any)?.message || exception.message;
        }

        // Handle AxiosError
        else if (exception instanceof AxiosError) {
            console.log('AxiosError:', exception);
            status = exception.response?.status || 500;
            errorMessage = exception.response?.data || exception.message || 'AXIOS_ERROR';
        }

        // Handle other exceptions
        else {
            errorMessage = exception?.message || 'INTERNAL_SERVER_ERROR';
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
