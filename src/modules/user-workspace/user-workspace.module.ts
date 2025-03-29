import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserWorkspace } from './user-workspace.entity';
import { UserWorkspaceService } from './user-workspace.service';
import { UserModule } from '@modules/user/user.module';
import { WorkspaceModule } from '@modules/workspace/workspace.module';

@Module({
    imports: [TypeOrmModule.forFeature([UserWorkspace]), UserModule, WorkspaceModule],
    providers: [UserWorkspaceService],
    exports: [UserWorkspaceService],
})
export class UserWorkspaceModule {}
