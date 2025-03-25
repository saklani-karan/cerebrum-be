import { Global, Module } from '@nestjs/common';
import { SignPasswordStrategyImpl, SIGN_PASSWORD_STRATEGY } from '.';

@Global()
@Module({
    providers: [
        {
            provide: SIGN_PASSWORD_STRATEGY,
            useClass: SignPasswordStrategyImpl,
        },
    ],
    exports: [SIGN_PASSWORD_STRATEGY],
})
export class SignPasswordStrategyModule {}
