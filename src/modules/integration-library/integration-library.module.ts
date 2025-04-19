import { Module } from '@nestjs/common';
import { IntegrationFactory } from './factory';
import { IntegrationLibraryService } from './integration-library.service';
import { IntegrationLibraryController } from './integration-library.controller';

@Module({
    imports: [],
    providers: [
        IntegrationFactory,
        ...IntegrationFactory.injectIntegrations(),
        IntegrationLibraryService,
    ],
    exports: [IntegrationFactory, IntegrationLibraryService],
    controllers: [IntegrationLibraryController],
})
export class IntegrationLibraryModule {}
