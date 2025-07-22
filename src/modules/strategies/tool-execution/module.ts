import { IntegrationAuthModule } from '@modules/integration-auth/integration-auth.module';
import { IntegrationLibraryModule } from '@modules/integration-library/integration-library.module';
import { Global, Module } from '@nestjs/common';
import { ToolExecutionStrategyImpl } from '.';
import { IntegrationModule } from '@modules/integration/integration.module';

export const TOOL_EXECUTION_STRATEGY: string = 'tool_execution_strategy';

@Global()
@Module({
    imports: [IntegrationAuthModule, IntegrationLibraryModule, IntegrationModule],
    providers: [
        {
            provide: TOOL_EXECUTION_STRATEGY,
            useClass: ToolExecutionStrategyImpl,
        },
    ],
    exports: [TOOL_EXECUTION_STRATEGY],
})
export class ToolExecutionStrategyModule {}
