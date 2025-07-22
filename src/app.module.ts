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
import { BullMQModule } from './modules/bullmq/bullmq.module';
import { bullMqConfig } from './config/bull-mq.config';
import { registerSubscribers } from '@modules/subscribers';
import { UserWorkspaceModule } from '@modules/user-workspace/user-workspace.module';
import { IntegrationLibraryModule } from '@modules/integration-library/integration-library.module';
import { SeederModule } from '@modules/seeder/seeder.module';
import { ToolModule } from '@modules/tool/tool.module';
import { IntegrationModule } from '@modules/integration/integration.module';
import config from './config';
import { HttpModule } from '@modules/http/http.module';
import { APP_GUARD } from '@nestjs/core';
import { AppAuthenticationGuard } from '@guards/authentication';
import { AssistantModule } from '@modules/assistant/assistant.module';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            load: [config],
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

        BullMQModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: bullMqConfig,
            inject: [ConfigService],
        }),
        HttpModule,
        AuthModule,
        AuthConfigModule,
        UserModule,
        SentryModule.forRoot(),
        UserWorkspaceModule,
        WorkspaceModule,
        ...StrategyModules,
        ...registerSubscribers(),
        ApiModule,
        IntegrationLibraryModule,
        ToolModule,
        IntegrationModule,
        SeederModule,
        AssistantModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AppAuthenticationGuard,
        },
    ],
})
export class AppModule {}
