import {
    HandleRedirectStrategy,
    HandleCallbackStrategy,
} from '@modules/strategies/integration-auth/types';
import { Controller, Get, Inject, Param } from '@nestjs/common';
import {
    HANDLE_REDIRECT_STRATEGY,
    HANDLE_CALLBACK_STRATEGY,
} from '@modules/strategies/integration-auth/module';
import { IsPublic } from '@decorators/authentication';

@Controller('integration-auth')
export class IntegrationAuthController {
    constructor(
        @Inject(HANDLE_REDIRECT_STRATEGY)
        private readonly handleRedirectStrategy: HandleRedirectStrategy,
        @Inject(HANDLE_CALLBACK_STRATEGY)
        private readonly handleCallbackStrategy: HandleCallbackStrategy,
    ) {}

    @Get(':integration_key/redirect')
    async redirect(@Param('integration_key') integrationKey: string) {
        return this.handleRedirectStrategy.exec({ integrationKey });
    }

    @IsPublic.set()
    @Get(':integration_key/callback')
    async callback(@Param('integration_key') integrationKey: string) {
        return this.handleCallbackStrategy.exec({ integrationKey });
    }
}
