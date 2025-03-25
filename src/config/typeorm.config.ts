import { ConfigService } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const typeOrmConfig = (configService: ConfigService): PostgresConnectionOptions =>
    ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        schema: configService.get('DB_SCHEMA'),
        logging: false,
        ssl: false,
        charset: 'utf8mb4_unicode_ci',
        synchronize: false,
        autoLoadEntities: true,
        extra: {
            max: configService.get('MAX_POOL'),
        },
    }) as PostgresConnectionOptions;
