import { AuthConfig, SimpleConfig } from '@modules/auth-config/auth-config.entity';
import { AuthConfigService } from '@modules/auth-config/auth-config.service';
import { Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ErrorTypes, throwException } from '@utils/exceptions';
import { Strategy } from 'passport-local';
import { EntityManager } from 'typeorm';
import { SIGN_PASSWORD_STRATEGY } from '@modules/strategies/sign-password';
import { SignPasswordStrategyInterface } from '@modules/strategies/sign-password/types';

export class LocalStrategy extends PassportStrategy(Strategy) {
    static provider: string = 'local';
    constructor(
        private readonly authConfigService: AuthConfigService,
        @Inject(SIGN_PASSWORD_STRATEGY)
        private readonly signPasswordStrategy: SignPasswordStrategyInterface,
        @InjectEntityManager() private readonly manager: EntityManager,
    ) {
        super({ usernameField: 'email' });
    }

    async validate(email: string, password: string) {
        return this.manager.transaction(async (txManager) => {
            const txAuthConfigService = this.authConfigService.withTransaction(txManager);

            let authConfig: AuthConfig;
            try {
                authConfig = await txAuthConfigService.findByEmailAndProvider(
                    email,
                    LocalStrategy.provider,
                );
            } catch (err) {
                throwException(ErrorTypes.FORBIDDEN, { message: err.message });
            }

            const hashPassword = await this.signPasswordStrategy.sign(password);
            if (hashPassword !== (authConfig.config as SimpleConfig)?.password) {
                throwException(ErrorTypes.FORBIDDEN, { message: 'Invalid password' });
            }

            return authConfig.user;
        });
    }
}
