import { ValidationPipe } from '@nestjs/common';
import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import { config } from 'dotenv';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import { Redis } from 'ioredis';
import { RedisStore } from 'connect-redis';
import { UnhandledExceptionFilter } from './filters/unhandled-exception.filter';
import { HttpExceptionFilter } from './filters/http-exceptions.filter';

config();

export async function bootstrap(): Promise<void> {
    const app: NestApplication = await NestFactory.create(AppModule);
    app.enableCors({
        allowedHeaders: [
            'content-type',
            'cookie',
            'Access-Control-Allow-Credentials',
            'Authorization',
            'Baggage',
            'Sentry-Trace',
            'Referer-Url',
            'Location',
            'Access-Control-Expose-Headers',
        ],
        origin: ['*'],
        credentials: true,
    });
    // app.enableCors();
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );
    app.useGlobalFilters(new UnhandledExceptionFilter(), new HttpExceptionFilter());
    app.use(json({ limit: '50mb' }));

    const redisClient = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
    });

    app.use(
        session({
            store: new RedisStore({
                client: redisClient,
                prefix: 'sessiontoken:',
            }),
            secret: process.env.SESSION_SECRET || 'my-secret',
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 7,
            },
            unset: 'destroy',
        }),
    );
    app.use(cookieParser());
    app.use(compression());

    await app.init();
    await app.listen(process.env.PORT);
}

bootstrap();
