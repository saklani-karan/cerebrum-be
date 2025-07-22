import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assistant } from './assistant.entity';
import { WorkspaceModule } from '@modules/workspace/workspace.module';
import { AssistantService } from './assistant.service';

@Module({
    imports: [TypeOrmModule.forFeature([Assistant]), WorkspaceModule],
    providers: [AssistantService],
    exports: [AssistantService],
})
export class AssistantModule {}
