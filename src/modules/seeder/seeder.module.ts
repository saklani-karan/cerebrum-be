import { Module } from '@nestjs/common';
import IntegrationAndToolSeeder from './scripts/integration-and-tool';
import { IntegrationModule } from '@modules/integration/integration.module';
import { ToolModule } from '@modules/tool/tool.module';
import { SeederRunner } from './seeder.runner';

@Module({
    imports: [IntegrationModule, ToolModule],
    providers: [IntegrationAndToolSeeder, SeederRunner],
    exports: [SeederRunner],
})
export class SeederModule {}
