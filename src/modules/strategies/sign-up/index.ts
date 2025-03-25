import { AuthConfig } from '@modules/auth-config/auth-config.entity';
import { AuthConfigService } from '@modules/auth-config/auth-config.service';
import { AuthService } from '@modules/auth/auth.service';
import { LocalStrategy } from '@modules/strategies/auth/local';
import { User } from '@modules/user/user.entity';
import { UserService } from '@modules/user/user.service';
import { Global, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Transactional } from '@utils/transaction';
import { createHash } from 'crypto';
import { Request } from 'express';
import { DeepPartial, EntityManager } from 'typeorm';
import { SIGN_PASSWORD_STRATEGY } from '../sign-password';
import { SignPasswordStrategyInterface } from '../sign-password/types';
import { SignUpRequest, SignUpStrategyInterface } from './types';

export const SIGN_UP_STRATEGY = 'sign_up_strategy';

@Injectable({ scope: Scope.REQUEST })
@Global()
export class SignUpStrategyImpl extends Transactional implements SignUpStrategyInterface {
    constructor(
        @Inject(REQUEST) private readonly request: Request,
        @Inject(SIGN_PASSWORD_STRATEGY)
        private readonly signPasswordStrategy: SignPasswordStrategyInterface,
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly authConfigService: AuthConfigService,
        @InjectEntityManager() manager: EntityManager,
    ) {
        super(manager);
    }

    exec(request: SignUpRequest): Promise<User> {
        return this.runTransaction(async (manager: EntityManager) => {
            const txUserService = this.userService.withTransaction(manager);
            const txAuthService = this.authService.withTransaction(manager);
            const txAuthConfigService = this.authConfigService.withTransaction(manager);

            const { email, password } = request;
            const user = await txUserService.create({ email });

            const hashedPassword = await this.signPasswordStrategy.sign(password);
            await txAuthConfigService.create({
                userId: user.id,
                config: {
                    password: hashedPassword,
                },
                provider: LocalStrategy.provider,
            } as DeepPartial<AuthConfig>);

            this.request.user = user;
            await txAuthService.sign();

            return user;
        });
    }
}
