import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly apiId?: string) { }

    catch(
        exception: Error | HttpException,
        host: ArgumentsHost,
    ) {
        console.log('exception', exception);
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException ? exception.getStatus() : 500;

        if (exception instanceof HttpException) {
            const statusCode = exception.getStatus();

            return response.status(statusCode).json((exception.getResponse() as any)?.message);
        }

        const errorMessage =
            exception?.message || 'INTERNAL_SERVER_ERROR';

        return response.status(status).json(errorMessage);
    }
}
