import { IntegrationAuthenticationCredentials } from '@modules/integration-library/types/integration';
import { Request } from 'express';

export interface GoogleAuthenticationCredentials extends IntegrationAuthenticationCredentials {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}

export class GoogleSession {
    userId: string;

    static fromRedirectRequest(request: Request): GoogleSession {
        const authSession = new GoogleSession();
        authSession.userId = request.user.id;
        return authSession;
    }

    static fromCallbackRequest(request: Request): GoogleSession {
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
