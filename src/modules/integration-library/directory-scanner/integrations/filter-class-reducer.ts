import { IntegrationMetadata } from '@modules/integration-library/decorators';
import { FilteredClassReducerInterface } from '@utils/scan-directory';
import { Provider } from '@nestjs/common';

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

        aggregator.push(integrationClass);
        return aggregator;
    }
}
