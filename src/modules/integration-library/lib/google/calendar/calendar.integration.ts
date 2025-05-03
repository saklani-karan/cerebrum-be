import { IntegrationMetadata } from '@modules/integration-library/decorators';
import { Inject, Injectable, Scope } from '@nestjs/common';
import GoogleIntegration from '../base';
import { REQUEST } from '@nestjs/core';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

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
    ) {
        super(request, configService, httpService);
    }
}
