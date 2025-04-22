import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tool } from './tool.entity';
import { ToolService } from './tool.service';
import { IntegrationModule } from '@modules/integration/integration.module';

@Module({
    imports: [TypeOrmModule.forFeature([Tool]), IntegrationModule],
    providers: [ToolService],
    exports: [ToolService],
})
export class ToolModule {}
