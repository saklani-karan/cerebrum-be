import { IntegrationMetadata } from '../../decorators';
import { IntegrationInterface } from '../../types/integration';
import { GoogleCalendarAuthenticationCredentials } from './types';

@IntegrationMetadata.define({
    name: 'Google Calendar',
    description: 'Integration for creating and managing Google Calendar events',
    key: 'google_calendar',
})
export default class GoogleCalendarIntegration
    implements IntegrationInterface<GoogleCalendarAuthenticationCredentials>
{
    async authenticate(): Promise<GoogleCalendarAuthenticationCredentials> {
        return {
            accessToken: 'accessToken',
            refreshToken: 'refreshToken',
            tokenType: 'tokenType',
            expiresIn: 3600,
            expirationAt: new Date(Date.now() + 3600 * 1000),
        };
    }
}
