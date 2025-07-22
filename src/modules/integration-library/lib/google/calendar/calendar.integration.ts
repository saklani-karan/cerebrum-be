import { IntegrationMetadata } from '@modules/integration-library/decorators';
import { Inject, Injectable, Scope } from '@nestjs/common';
import GoogleIntegration from '../base';
import { REQUEST } from '@nestjs/core';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@IntegrationMetadata.define({
    name: 'Google Calendar',
    description: 'Integration for creating and managing Google Calendar events',
    key: 'google_calendar',
})
@Injectable({ scope: Scope.REQUEST })
export default class GoogleCalendarIntegration extends GoogleIntegration {
    constructor(
        @Inject(REQUEST) protected readonly request: Request,
        protected readonly configService: ConfigService,
        protected readonly httpService: HttpService,
        @Inject(CACHE_MANAGER) cacheManager: Cache,
    ) {
        super(request, configService, httpService, cacheManager);
    }
}
