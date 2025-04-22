import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx: HttpArgumentsHost = host.switchToHttp();
        const request: Request = ctx.getRequest();
        const response: Response = ctx.getResponse();

        response.status(exception.getStatus()).json({
            name: exception.name,
            message: exception.message,
            cause: exception.cause,
            data: exception.getResponse(),
            statusCode: exception.getStatus(),
            timestamp: new Date().toISOString(),
            validationErrors: exception.getResponse()['validationErrors'],
            url: request.url,
        });
    }
}
