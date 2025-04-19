'use strict';
import { HttpException } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';

export type ValidationError = {
    path: string;
    errors: string[];
};

export type ExceptionProps = {
    message: string;
    code: StatusCodes;
    data?: any;
    type?: string;
    ref?: string;
    name: string;
    validationErrors?: ValidationError[];
};

export class Exception extends HttpException {
    data: any;
    type: string | undefined;
    ref: string | undefined;
    name: string;
    validationErrors?: ValidationError[];
    constructor({ message, code, data, type, ref, name, validationErrors }: ExceptionProps) {
        super(message, code);
        this.data = data;
        this.type = type;
        this.ref = ref;
        this.name = name;
        this.validationErrors = validationErrors;
    }
}

export enum ErrorTypes {
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    INVALID_ARGUMENTS = 'INVALID_ARGUMENTS',
    ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
    ACCOUNT_NOT_AVAILABLE = 'ACCOUNT_NOT_AVAILABLE',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    ENTITY_EXISTS = 'ENTITY_EXISTS',
    DB_ERROR = 'DB_ERROR',
    UNSUPPORTED_FEATURE = 'UNSUPPORTED_FEATURE',
    FILE_UPLOAD_EXCEPTION = 'FILE_UPLOAD_EXCEPTION',
    HTTP_EXCEPTION = 'HTTP_EXCEPTION',
    AWS_ERROR = 'AWS_ERROR',
    OPERATION_DISABLED = 'OPERATION_DISABLED',
    PREV_STEP_PENDING = 'PREV_STEP_PENDING',
    CONFLICT = 'CONFLICT',
}

export const errorConfiguration: {
    [key in ErrorTypes]: {
        code: StatusCodes;
        name: string;
    };
} = {
    [ErrorTypes.INTERNAL_SERVER_ERROR]: {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        name: 'InternalServerError',
    },
    [ErrorTypes.INVALID_ARGUMENTS]: {
        code: StatusCodes.BAD_REQUEST,
        name: 'InvalidArguments',
    },
    [ErrorTypes.ENTITY_NOT_FOUND]: {
        code: StatusCodes.NOT_FOUND,
        name: 'EntityNotFound',
    },
    [ErrorTypes.ACCOUNT_NOT_AVAILABLE]: {
        code: StatusCodes.NOT_FOUND,
        name: 'NoAccountsAvailable',
    },
    [ErrorTypes.ENTITY_EXISTS]: {
        code: StatusCodes.CONFLICT,
        name: 'EntityExists',
    },
    [ErrorTypes.DB_ERROR]: {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        name: 'DatabaseException',
    },
    [ErrorTypes.UNSUPPORTED_FEATURE]: {
        code: StatusCodes.NOT_IMPLEMENTED,
        name: 'UnsupportedFeature',
    },
    [ErrorTypes.FILE_UPLOAD_EXCEPTION]: {
        code: StatusCodes.BAD_GATEWAY,
        name: 'UnsupportedFeature',
    },
    [ErrorTypes.HTTP_EXCEPTION]: {
        code: StatusCodes.BAD_REQUEST,
        name: 'HttpError',
    },
    [ErrorTypes.AWS_ERROR]: {
        code: StatusCodes.BAD_REQUEST,
        name: 'AwsError',
    },
    [ErrorTypes.OPERATION_DISABLED]: {
        code: StatusCodes.METHOD_NOT_ALLOWED,
        name: 'OperationDisabled',
    },
    [ErrorTypes.PREV_STEP_PENDING]: {
        code: StatusCodes.BAD_REQUEST,
        name: 'PrevStepPending',
    },
    [ErrorTypes.CONFLICT]: {
        code: StatusCodes.CONFLICT,
        name: 'Conflict',
    },
    [ErrorTypes.UNAUTHORIZED]: {
        code: StatusCodes.UNAUTHORIZED,
        name: 'Unauthorized',
    },
    [ErrorTypes.FORBIDDEN]: {
        code: StatusCodes.FORBIDDEN,
        name: 'Forbidden',
    },
};

export type ThrowExceptionProps = {
    message: string;
    type?: string;
    data?: any;
    ref?: string;
    validationErrors?: ValidationError[];
};

export function throwException(errorType: ErrorTypes, props: ThrowExceptionProps): void;
export function throwException(error: Error): void;
export function throwException(error: Exception): void;
export function throwException(error: ErrorTypes | Error | Exception, props?: ThrowExceptionProps) {
    if (error instanceof Exception) {
        throw error;
    } else if (error instanceof Error) {
        return throwException(ErrorTypes.INTERNAL_SERVER_ERROR, {
            message: error.message,
        });
    }
    const { message, type, data, ref, validationErrors } = props || {};
    const config: {
        code: StatusCodes;
        name: string;
    } = errorConfiguration[error];
    throw new Exception({
        code: config.code,
        name: config.name,
        message: message || '',
        type: type ?? error,
        data,
        ref,
        validationErrors,
    });
}
