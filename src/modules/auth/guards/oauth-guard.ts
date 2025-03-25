import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ErrorTypes, throwException } from '@utils/exceptions';
import { GoogleStrategy } from '@modules/strategies/auth/google';
import { MicrosoftStrategy } from '@modules/strategies/auth/microsoft';

@Injectable()
export class OAuthGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const strategy: string = this.getStrategyFromRequest(request);

        if (!strategy || !this.validateStrategy(strategy)) {
            throwException(ErrorTypes.FORBIDDEN, {
                message: 'Invalid provider found in params',
                data: {
                    strategy,
                },
            });
        }

        // Dynamically set the strategy
        const guard = new (AuthGuard(strategy))();
        return guard.canActivate(context) as Promise<boolean>;
    }

    private getStrategyFromRequest(request: Request): string {
        return request.params.provider;
    }

    private validateStrategy(strategy: string): boolean {
        return [GoogleStrategy.provider, MicrosoftStrategy.provider].includes(strategy);
    }
}
