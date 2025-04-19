import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Exception } from '@utils/exceptions';
import { Request, Response } from 'express';

@Catch(Exception)
export class BaseExceptionFilter implements ExceptionFilter {
    catch(exception: Exception, host: ArgumentsHost) {
        const ctx: HttpArgumentsHost = host.switchToHttp();
        const request: Request = ctx.getRequest();
        const response: Response = ctx.getResponse();
        response.status(exception.getStatus()).json({
            name: exception.name,
            message: exception.message,
            cause: exception.cause,
            validationErrors: exception.validationErrors,
            statusCode: exception.getStatus(),
            timestamp: new Date().toISOString(),
            url: request.url,
        });
    }
}
