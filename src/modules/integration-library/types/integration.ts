import { IntegrationCredentials } from '@modules/integration-auth/integration-auth.entity';

export interface IntegrationAuthenticationCredentials {
    identifier: string;
    expirationAt: Date;
}

export type IntegrationAccount = {
    id: string;
    name: string;
    picture: string;
};

export type CallbackResponse = {
    credentials: IntegrationCredentials;
    account: IntegrationAccount;
    userId: string;
};

export interface IntegrationInterface<
    AuthenticationCredentials extends
        IntegrationAuthenticationCredentials = IntegrationAuthenticationCredentials,
> {
    authenticate(): Promise<AuthenticationCredentials>;
    redirect(finalRedirectUrl: string): Promise<string>;
    callback(finalRedirectUrl: string): Promise<CallbackResponse>;
}

export const buildIntegrationInjectionToken = (integrationKey: string) => {
    return `integration:${integrationKey}`;
};
