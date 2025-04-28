import { config } from 'dotenv';
config();

export interface GoogleIntegrationConfig {
    clientId: string;
    clientSecret: string;
    authBaseUrl: string;
    apiBaseUrl: string;
    tokenUrl: string;
    scopes: {
        calendar: string[];
    };
}

export const googleIntegrationConfig: GoogleIntegrationConfig = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authBaseUrl: process.env.GOOGLE_AUTH_BASE_URL,
    apiBaseUrl: process.env.GOOGLE_API_BASE_URL,
    tokenUrl: process.env.GOOGLE_TOKEN_URL,
    scopes: {
        calendar: process.env.GOOGLE_CALENDAR_SCOPES?.split(','),
    },
};
