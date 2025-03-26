import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { cacheConfig } from './config/cache.config';
import { typeOrmConfig } from './config/typeorm.config';
import { SentryModule } from '@sentry/nestjs/setup';
import { StrategyModules } from '@modules/strategies';
import { AuthModule } from '@modules/auth/auth.module';
import { AuthConfigModule } from '@modules/auth-config/auth-config.module';
import { UserModule } from '@modules/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { ApiModule } from '@modules/api/api.module';
import { WorkspaceModule } from '@modules/workspace/workspace.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        PassportModule.register({
            session: false,
            property: 'user',
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: typeOrmConfig,
        }),

        CacheModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: cacheConfig,
            isGlobal: true,
        }),
        AuthModule,
        AuthConfigModule,
        UserModule,
        SentryModule.forRoot(),
        WorkspaceModule,
        ...StrategyModules,
        ApiModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
