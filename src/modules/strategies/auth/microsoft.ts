import { Injectable, Scope } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '@modules/auth-config/auth-config.service';
import { UserService } from '@modules/user/user.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from '@modules/user/user.entity';

export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  static provider: string = 'microsoft';
  constructor(
    configService: ConfigService,
    private readonly authConfigService: AuthConfigService,
    private readonly userService: UserService,
    @InjectEntityManager() private readonly manager: EntityManager,
  ) {
    super({
      clientID: configService.get('MICROSOFT_CLIENT_ID'),
      clientSecret: configService.get('MICROSOFT_CLIENT_SECRET'),
      callbackURL: configService.get('MICROSOFT_CALLBACK_URL'),
      tenant: configService.get('MICROSOFT_TENANT'),
      scope: ['user.read', 'openid', 'profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    return this.manager.transaction(async (txManager) => {
      const txUserService = this.userService.withTransaction(txManager);
      const txAuthConfigService =
        this.authConfigService.withTransaction(txManager);
      const { id, displayName, emails, name } = profile;

      let user: User;
      try {
        user = await txUserService.findOrCreate({
          email: emails[0].value?.toLowerCase(),
          firstName: name?.givenName || displayName.split(' ')[0],
          lastName:
            name?.familyName || displayName.split(' ').slice(1).join(' '),
        });
      } catch (err) {
        return done(err, null);
      }

      try {
        await txAuthConfigService.upsertByUserId(
          user.id,
          MicrosoftStrategy.provider,
          {
            refreshToken,
            accessToken,
          },
        );
      } catch (err) {
        return done(err, null);
      }

      return done(null, user);
    });
  }
}
