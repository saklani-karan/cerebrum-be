import {
    IntegrationDefinitionMetadata,
    IntegrationMetadata,
} from '@modules/integration-library/decorators';
import { FilteredClassReducerInterface } from '@utils/scan-directory';

export class SeederIntegrationFilterClassReducer
    implements FilteredClassReducerInterface<IntegrationDefinitionMetadata>
{
    exec(
        exports: any,
        aggregator: IntegrationDefinitionMetadata[],
    ): IntegrationDefinitionMetadata[] {
        if (!exports.default) {
            return aggregator;
        }

        const integrationClass = exports.default;
        const metadata = IntegrationMetadata.retrieve(integrationClass);
        if (!metadata) {
            return aggregator;
        }

        aggregator.push(metadata);
        return aggregator;
    }
}
