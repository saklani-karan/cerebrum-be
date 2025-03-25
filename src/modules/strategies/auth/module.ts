import { AuthConfigModule } from '@modules/auth-config/auth-config.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { Global, Module } from '@nestjs/common';
import { GoogleStrategy } from './google';
import { LocalStrategy } from './local';
import { MicrosoftStrategy } from './microsoft';

@Global()
@Module({
    providers: [LocalStrategy, GoogleStrategy],
    exports: [LocalStrategy, GoogleStrategy],
    imports: [UserModule, AuthModule, AuthConfigModule],
})
export class AuthStrategyModule {}
