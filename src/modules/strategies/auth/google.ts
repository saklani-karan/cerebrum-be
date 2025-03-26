import { Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '@modules/auth-config/auth-config.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UserService } from '@modules/user/user.service';
import { User } from '@modules/user/user.entity';
import { throwException, ErrorTypes } from '@utils/exceptions';
import { CREATE_USER_STRATEGY } from '../create-user';
import { CreateUserStrategyInterface } from '../create-user/types';

export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    static provider: string = 'google';
    constructor(
        configService: ConfigService,
        private readonly authConfigService: AuthConfigService,
        private readonly userService: UserService,
        @Inject(CREATE_USER_STRATEGY)
        private readonly createUserStrategy: CreateUserStrategyInterface,
        @InjectEntityManager() private readonly manager: EntityManager,
    ) {
        super({
            clientID: configService.get('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
            callbackURL: `${configService.get('BASE_URL')}/oauth/google/callback`,
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
        return this.manager
            .transaction(async (txManager) => {
                const txUserService = this.userService.withTransaction(txManager);
                const txAuthConfigService = this.authConfigService.withTransaction(txManager);
                const txCreateUserStrategy = this.createUserStrategy.withTransaction(txManager);

                const email = this.resolveEmail(profile);
                const dpUrl = this.resolveDpUrl(profile);
                const name = this.resolveName(profile);

                if (!email) {
                    throwException(ErrorTypes.INVALID_ARGUMENTS, { message: 'email not found' });
                }

                let user: User;
                try {
                    user = await txUserService.findByEmail(email);
                } catch (err) {
                    if (err.type !== ErrorTypes.ENTITY_NOT_FOUND) {
                        throwException(err);
                    }
                    user = null;
                }

                if (!user) {
                    user = await txCreateUserStrategy.exec({
                        email,
                        name,
                        dpUrl,
                    });
                } else {
                    await txUserService.update(user.id, {
                        name,
                        dpUrl,
                    });
                }

                try {
                    await txAuthConfigService.upsertByUserId(user.id, GoogleStrategy.provider, {
                        refreshToken,
                        accessToken,
                    });
                } catch (err) {
                    throwException(err);
                }

                return user;
            })
            .then((user) => {
                return done(null, user);
            })
            .catch((err) => {
                return done(err, null);
            });
    }

    private resolveEmail(profile: any): string | null {
        if (!profile?.emails?.[0]?.value) {
            return null;
        }

        return profile.emails[0].value.toLowerCase();
    }

    private resolveDpUrl(profile: any): string | null {
        if (!profile?.photos?.[0]?.value) {
            return null;
        }

        return profile.photos[0].value;
    }

    private resolveName(profile: any): string | null {
        if (!profile?.name?.givenName) {
            return null;
        }

        return profile.name.givenName;
    }
}
