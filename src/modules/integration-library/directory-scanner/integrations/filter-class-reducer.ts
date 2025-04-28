import { IntegrationMetadata } from '@modules/integration-library/decorators';
import { FilteredClassReducerInterface } from '@utils/scan-directory';
import { Provider, Scope } from '@nestjs/common';
import { buildIntegrationInjectionToken } from '@modules/integration-library/types/integration';
export class IntegrationFilterClassReducer implements FilteredClassReducerInterface<Provider> {
    exec(exports: any, aggregator: Provider[]): Provider[] {
        if (!exports.default) {
            return aggregator;
        }

        const integrationClass = exports.default;
        const metadata = IntegrationMetadata.retrieve(integrationClass);
        if (!metadata) {
            return aggregator;
        }

        aggregator.push({
            provide: buildIntegrationInjectionToken(metadata.key),
            useClass: integrationClass,
            scope: Scope.REQUEST,
        });
        aggregator.push(integrationClass);
        return aggregator;
    }
}
