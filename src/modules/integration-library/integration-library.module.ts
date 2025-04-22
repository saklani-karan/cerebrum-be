import { Module } from '@nestjs/common';
import { ToolFactory } from './integration-tool.factory';
import { IntegrationLibraryService } from './integration-library.service';
import { IntegrationLibraryController } from './integration-library.controller';
import { injectProviders } from './directory-scanner';
@Module({
    imports: [],
    providers: [...injectProviders(), ToolFactory, IntegrationLibraryService],
    exports: [ToolFactory, IntegrationLibraryService],
    controllers: [IntegrationLibraryController],
})
export class IntegrationLibraryModule {}
