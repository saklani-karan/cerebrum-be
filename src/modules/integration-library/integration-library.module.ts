import { Module } from '@nestjs/common';
import { ToolFactory, IntegrationFactory } from './integration-tool.factory';
import { injectProviders } from './directory-scanner';
@Module({
    imports: [],
    providers: [...injectProviders(), ToolFactory, IntegrationFactory],
    exports: [ToolFactory, IntegrationFactory],
})
export class IntegrationLibraryModule {}
