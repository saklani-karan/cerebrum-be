import { CallbackResponse, IntegrationInterface } from '../../types/integration';
import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { GoogleIntegrationConfig } from '@config/integration/google';
import {
    IntegrationCredentialsType,
    OAuth2Credentials,
} from '@modules/integration-auth/integration-auth.entity';
import {
    GoogleSession,
    GoogleTokenResponse,
    GoogleUser,
    GoogleAuthenticationCredentials,
} from './types';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ErrorTypes, throwException } from '@utils/exceptions';
import { AxiosResponse } from 'axios';
import { tryCatch } from '@utils/try-catch';

export default class GoogleIntegration
    implements IntegrationInterface<GoogleAuthenticationCredentials>
{
    private readonly logger: Logger;
    constructor(
        protected readonly request: Request,
        protected readonly configService: ConfigService,
        protected readonly httpService: HttpService,
    ) {
        this.logger = new Logger(this.constructor.name);
    }

    async authenticate(): Promise<GoogleAuthenticationCredentials> {
        return {
            identifier: 'identifier',
            accessToken: 'accessToken',
            refreshToken: 'refreshToken',
            tokenType: 'tokenType',
            expiresIn: 3600,
            expirationAt: new Date(Date.now() + 3600 * 1000),
        };
    }

    async redirect(finalRedirectUrl: string): Promise<string> {
        const integrationAuthSession = GoogleSession.fromRedirectRequest(this.request);
        const config: GoogleIntegrationConfig = this.configService.getOrThrow('integration.google');
        const scope = config.scopes.calendar.join(' ');

        const params = new URLSearchParams({
            client_id: config.clientId,
            response_type: 'code',
            access_type: 'offline',
            scope,
            state: JSON.stringify(integrationAuthSession),
            redirect_uri: finalRedirectUrl,
        });

        return `${config.authBaseUrl}?${params.toString()}`;
    }

    async callback(finalRedirectUrl: string): Promise<CallbackResponse> {
        const { code, session } = this.retrieveCodeAndStateFromRequest();

        const config: GoogleIntegrationConfig = this.configService.getOrThrow('integration.google');

        const [error, response]: [Error, AxiosResponse<GoogleTokenResponse>] = await tryCatch(
            lastValueFrom(
                this.httpService.post(config.tokenUrl, {
                    code,
                    client_id: config.clientId,
                    client_secret: config.clientSecret,
                    grant_type: 'authorization_code',
                    redirect_uri: finalRedirectUrl,
                }),
            ),
        );

        if (error) {
            console.log(error);
            this.logger.error('Failed to exchange code for token', error);
            throwException(ErrorTypes.HTTP_EXCEPTION, {
                message: 'Failed to exchange code for token',
                data: error,
            });
        }

        const tokenResponse: GoogleTokenResponse = response.data;
        const user = await this.retrieveUser(config, tokenResponse.access_token);

        const credentials: OAuth2Credentials = {
            type: IntegrationCredentialsType.OAUTH2,
            expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
        };

        return {
            credentials,
            account: {
                id: user.id,
                name: user.name,
                picture: user.picture,
            },
            userId: session.userId,
        };
    }

    private async retrieveUser(
        config: GoogleIntegrationConfig,
        accessToken: string,
    ): Promise<GoogleUser> {
        let response: AxiosResponse<any>;
        try {
            response = await lastValueFrom(
                this.httpService.get(config.apiBaseUrl + '/oauth2/v1/userinfo', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }),
            );
        } catch (error) {
            console.log(error);
            throwException(ErrorTypes.HTTP_EXCEPTION, {
                message: 'Failed to retrieve user',
                data: error.response.data,
            });
        }

        return {
            id: response.data.id,
            email: response.data.email,
            name: response.data.name,
            givenName: response.data.given_name,
            familyName: response.data.family_name,
            picture: response.data.picture,
            locale: response.data.locale,
        };
    }

    private retrieveCodeAndStateFromRequest(): {
        code: string;
        session: GoogleSession;
    } {
        const { code } = this.request.query;
        return {
            code: code as string,
            session: GoogleSession.fromCallbackRequest(this.request),
        };
    }
}
