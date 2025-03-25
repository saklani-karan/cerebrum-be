import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';

@Catch(Error)
export class UnhandledExceptionFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        const ctx: HttpArgumentsHost = host.switchToHttp();
        const request: Request = ctx.getRequest();
        const response: Response = ctx.getResponse();

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            name: exception.name,
            message: exception.message,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            url: request.url,
        });
    }
}
