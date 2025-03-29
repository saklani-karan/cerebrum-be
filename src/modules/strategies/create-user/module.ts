import { Global, Module } from '@nestjs/common';
import { CreateUserStrategyImpl, CREATE_USER_STRATEGY } from '.';
import { UserModule } from '@modules/user/user.module';
import { UserWorkspaceModule } from '@modules/user-workspace/user-workspace.module';
@Global()
@Module({
    imports: [UserModule, UserWorkspaceModule],
    providers: [
        {
            provide: CREATE_USER_STRATEGY,
            useClass: CreateUserStrategyImpl,
        },
    ],
    exports: [CREATE_USER_STRATEGY],
})
export class CreateUserStrategyModule {}
