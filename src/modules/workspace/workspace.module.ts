import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './workspace.entity';
import { WorkspaceService } from './workspace.service';
import { UserModule } from '@modules/user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([Workspace]), UserModule],
    controllers: [],
    providers: [WorkspaceService],
    exports: [WorkspaceService],
})
export class WorkspaceModule {}
