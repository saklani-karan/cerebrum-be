import { AuthConfig } from '@modules/auth-config/auth-config.entity';
import { AuthConfigService } from '@modules/auth-config/auth-config.service';
import { AuthService } from '@modules/auth/auth.service';
import { LocalStrategy } from '@modules/strategies/auth/local';
import { User } from '@modules/user/user.entity';
import { Global, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Transactional } from '@utils/transaction';
import { Request } from 'express';
import { DeepPartial, EntityManager } from 'typeorm';
import { SIGN_PASSWORD_STRATEGY } from '../sign-password';
import { SignPasswordStrategyInterface } from '../sign-password/types';
import { SignUpRequest, SignUpStrategyInterface } from './types';
import { CREATE_USER_STRATEGY } from '../create-user';
import { CreateUserStrategyInterface } from '../create-user/types';

export const SIGN_UP_STRATEGY = 'sign_up_strategy';

@Injectable({ scope: Scope.REQUEST })
@Global()
export class SignUpStrategyImpl extends Transactional implements SignUpStrategyInterface {
    constructor(
        @Inject(REQUEST) private readonly request: Request,
        @Inject(SIGN_PASSWORD_STRATEGY)
        private readonly signPasswordStrategy: SignPasswordStrategyInterface,
        @Inject(CREATE_USER_STRATEGY)
        private readonly createUserStrategy: CreateUserStrategyInterface,
        private readonly authService: AuthService,
        private readonly authConfigService: AuthConfigService,
        @InjectEntityManager() manager: EntityManager,
    ) {
        super(manager);
    }

    exec(request: SignUpRequest): Promise<User> {
        return this.runTransaction(async (manager: EntityManager) => {
            const txAuthService = this.authService.withTransaction(manager);
            const txAuthConfigService = this.authConfigService.withTransaction(manager);
            const txCreateUserStrategy = this.createUserStrategy.withTransaction(manager);

            const { email, password } = request;
            const user = await txCreateUserStrategy.exec({ email });

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
