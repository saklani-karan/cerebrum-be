import { Module, Global } from '@nestjs/common';
import { IntegrationAuthModule } from '@modules/integration-auth/integration-auth.module';
import { HandleRedirectStrategyImpl } from './handle-redirect';
import { HandleCallbackStrategyImpl } from './handle-callback';
import { IntegrationModule } from '@modules/integration/integration.module';
import { IntegrationLibraryModule } from '@modules/integration-library/integration-library.module';
export const HANDLE_REDIRECT_STRATEGY = 'HANDLE_REDIRECT_STRATEGY';
export const HANDLE_CALLBACK_STRATEGY = 'HANDLE_CALLBACK_STRATEGY';

@Global()
@Module({
    imports: [IntegrationAuthModule, IntegrationModule, IntegrationLibraryModule],
    providers: [
        {
            provide: HANDLE_REDIRECT_STRATEGY,
            useClass: HandleRedirectStrategyImpl,
        },
        {
            provide: HANDLE_CALLBACK_STRATEGY,
            useClass: HandleCallbackStrategyImpl,
        },
    ],
    exports: [HANDLE_REDIRECT_STRATEGY, HANDLE_CALLBACK_STRATEGY],
})
export class IntegrationAuthStrategyModule {}
