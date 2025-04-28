import { IntegrationAuthenticationCredentials } from '@modules/integration-library/types/integration';
import { Request } from 'express';

export interface GoogleCalendarAuthenticationCredentials
    extends IntegrationAuthenticationCredentials {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}

export class GoogleCalendarSession {
    userId: string;

    static fromRedirectRequest(request: Request): GoogleCalendarSession {
        const authSession = new GoogleCalendarSession();
        authSession.userId = request.user.id;
        return authSession;
    }

    static fromCallbackRequest(request: Request): GoogleCalendarSession {
        const { state } = request.query;
        const authSession = JSON.parse(state as string);
        return authSession;
    }
}

export interface GoogleUser {
    id: string;
    email: string;
    name: string;
    givenName: string;
    familyName: string;
    picture: string;
    locale: string;
}

export interface GoogleTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}
