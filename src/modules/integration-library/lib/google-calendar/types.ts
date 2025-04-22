import { IntegrationAuthenticationCredentials } from '@modules/integration-library/types/integration';

export interface GoogleCalendarAuthenticationCredentials
    extends IntegrationAuthenticationCredentials {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}
