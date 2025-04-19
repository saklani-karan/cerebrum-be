import { Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '@modules/auth-config/auth-config.service';
import { UserService } from '@modules/user/user.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { throwException, ErrorTypes, Exception } from '@utils/exceptions';
import { CREATE_USER_STRATEGY } from '../create-user';
import { CreateUserStrategyInterface } from '../create-user/types';
import { tryCatch } from '@utils/try-catch';
import { AuthConfig } from '@modules/auth-config/auth-config.entity';
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
    static provider: string = 'microsoft';
    constructor(
        configService: ConfigService,
        private readonly authConfigService: AuthConfigService,
        private readonly userService: UserService,
        @InjectEntityManager() private readonly manager: EntityManager,
        @Inject(CREATE_USER_STRATEGY)
        private readonly createUserStrategy: CreateUserStrategyInterface,
    ) {
        super({
            clientID: configService.get('MICROSOFT_CLIENT_ID'),
            clientSecret: configService.get('MICROSOFT_CLIENT_SECRET'),
            callbackURL: configService.get('MICROSOFT_CALLBACK_URL'),
            tenant: configService.get('MICROSOFT_TENANT'),
            scope: ['user.read', 'openid', 'profile', 'email'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
        return this.manager
            .transaction(async (txManager) => {
                const txUserService = this.userService.withTransaction(txManager);
                const txAuthConfigService = this.authConfigService.withTransaction(txManager);
                const txCreateUserStrategy = this.createUserStrategy.withTransaction(txManager);
                const email = this.resolveEmail(profile);
                const name = this.resolveName(profile);
                const dpUrl = this.resolveDpUrl(profile);

                let [error, user] = await tryCatch(txUserService.findByEmail(email));

                if (error) {
                    if (
                        !(error instanceof Exception && error.type === ErrorTypes.ENTITY_NOT_FOUND)
                    ) {
                        throwException(error);
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

                const authConfig: AuthConfig = await txAuthConfigService.upsertByUserId(
                    user.id,
                    MicrosoftStrategy.provider,
                    {
                        refreshToken,
                        accessToken,
                    },
                );

                return user;
            })
            .then((user) => {
                return done(null, user);
            })
            .catch((error) => {
                return done(error, null);
            });
    }

    private resolveEmail(profile: any): string | null {
        if (!profile?.emails?.[0]?.value) {
            return null;
        }

        return profile.emails[0].value.toLowerCase();
    }

    private resolveName(profile: any): string | null {
        if (!profile?.name?.givenName || !profile?.displayName) {
            return null;
        }

        return profile.name.givenName || profile.displayName;
    }

    private resolveDpUrl(profile: any): string | null {
        if (!profile?.photos?.[0]?.value) {
            return null;
        }

        return profile.photos[0].value;
    }
}
