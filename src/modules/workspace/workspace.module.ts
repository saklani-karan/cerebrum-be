import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './workspace.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Workspace])],
    controllers: [],
    providers: [],
    exports: [],
})
export class WorkspaceModule {}
