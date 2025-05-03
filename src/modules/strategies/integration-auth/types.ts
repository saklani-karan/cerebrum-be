import { IntegrationAuth } from '@modules/integration-auth/integration-auth.entity';
import { Transactional } from '@utils/transaction';

export interface HandleRedirectParams {
    integrationKey: string;
}

export interface HandleRedirectStrategy extends Transactional {
    exec(params: HandleRedirectParams): Promise<string>;
}

export interface HandleCallbackParams {
    integrationKey: string;
}

export interface HandleCallbackStrategy {
    exec(params: HandleCallbackParams): Promise<IntegrationAuth>;
}
