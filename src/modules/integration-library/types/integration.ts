import { IntegrationCredentials } from '@modules/integration-auth/integration-auth.entity';

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

export interface IntegrationInterface {
    authenticate(forceRefresh?: boolean): Promise<IntegrationCredentials>;
    redirect(finalRedirectUrl: string): Promise<string>;
    callback(finalRedirectUrl: string): Promise<CallbackResponse>;
    setCredentials(credentials: IntegrationCredentials): void;
}

export const buildIntegrationInjectionToken = (integrationKey: string) => {
    return `integration:${integrationKey}`;
};
