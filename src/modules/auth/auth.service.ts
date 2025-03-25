import { User } from '@modules/user/user.entity';
import { UserService } from '@modules/user/user.service';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ErrorTypes, throwException } from '@utils/exceptions';
import { Transactional } from '@utils/transaction';
import { createHash } from 'crypto';
import { Request } from 'express';
import { EntityManager } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class AuthService extends Transactional {
    constructor(
        @Inject(REQUEST) private readonly request: Request,
        private readonly userService: UserService,
        @InjectEntityManager() manager: EntityManager,
    ) {
        super(manager);
    }

    async sign(): Promise<void> {
        const user = this.request.user;
        this.request.session.userId = user.id;
        return;
    }

    async resolve(): Promise<User> {
        if (!this.request.session.userId) {
            throwException(ErrorTypes.INVALID_ARGUMENTS, {
                message: 'userId not found in session',
            });
        }

        const userId = this.request.session.userId;
        const user = await this.userService.get(userId);

        return user;
    }

    async logout(): Promise<void> {
        this.request.session.userId = null;
        return;
    }

    async me(): Promise<User> {
        const userId = this.request.session.userId;
        return this.userService.get(userId);
    }
}
