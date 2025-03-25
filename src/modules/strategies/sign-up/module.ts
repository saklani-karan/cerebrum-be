import { AuthConfigModule } from '@modules/auth-config/auth-config.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { Global, Module } from '@nestjs/common';
import { SignUpStrategyImpl, SIGN_UP_STRATEGY } from '.';

@Global()
@Module({
    imports: [UserModule, AuthConfigModule, AuthModule],
    providers: [
        {
            provide: SIGN_UP_STRATEGY,
            useClass: SignUpStrategyImpl,
        },
    ],
    exports: [SIGN_UP_STRATEGY],
})
export class SignUpStrategyModule {}
