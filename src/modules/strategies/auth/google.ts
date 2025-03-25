import { Injectable, Scope } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '@modules/auth-config/auth-config.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UserService } from '@modules/user/user.service';
import { User } from '@modules/user/user.entity';

export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    static provider: string = 'google';
    constructor(
        configService: ConfigService,
        private readonly authConfigService: AuthConfigService,
        private readonly userService: UserService,
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
        return this.manager.transaction(async (txManager) => {
            const txUserService = this.userService.withTransaction(txManager);
            const txAuthConfigService = this.authConfigService.withTransaction(txManager);
            const { id, name, emails } = profile;

            let user: User;
            try {
                user = await txUserService.findOrCreate({
                    email: emails[0].value?.toLowerCase(),
                    firstName: name.givenName,
                    lastName: name.familyName,
                });
            } catch (err) {
                return done(err, null);
            }

            try {
                await txAuthConfigService.upsertByUserId(user.id, GoogleStrategy.provider, {
                    refreshToken,
                    accessToken,
                });
            } catch (err) {
                return done(err, null);
            }

            return done(null, user);
        });
    }
}
