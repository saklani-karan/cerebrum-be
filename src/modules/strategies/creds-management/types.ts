import { IntegrationCredentials } from '@modules/integration-auth/integration-auth.entity';

export type RetrieveTokenOptions = {
    forceRefresh?: boolean;
    refreshCb?: (credentials: IntegrationCredentials) => Promise<IntegrationCredentials>;
};

export interface CredentialsManagementStrategy {
    retrieve(id: string, options?: RetrieveTokenOptions): Promise<IntegrationCredentials>;
    initialize(id: string, credentials: IntegrationCredentials): Promise<void>;
}
