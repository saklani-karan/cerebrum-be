import {
    ToolMetadata,
    ToolDefinitionMetadata,
    IntegrationReference,
} from '@modules/integration-library/decorators';
import { ToolDefinitionTemplate } from '@modules/integration-library/types/tool';
import { Provider, Scope } from '@nestjs/common';
import { FilteredClassReducerInterface } from '@utils/scan-directory';

export class ToolFilterClassReducer implements FilteredClassReducerInterface<Provider> {
    exec(exports: any, aggregator: Provider[]): Provider[] {
        if (!exports.default) {
            return aggregator;
        }

        const toolClass = exports.default;
        if (!this.isToolExecutable(toolClass)) {
            console.log('toolClass is not executable', toolClass);
            return aggregator;
        }

        const metadata: ToolDefinitionMetadata = ToolMetadata.retrieve(toolClass);
        const integrationReference: string = IntegrationReference.retrieve(toolClass);
        if (!metadata || !integrationReference) {
            return aggregator;
        }

        aggregator.push({
            provide: ToolDefinitionTemplate.buildInjectionToken(integrationReference, metadata.key),
            useClass: toolClass,
            scope: Scope.REQUEST,
        });
        return aggregator;
    }

    private isToolExecutable(toolClass: any) {
        return (
            toolClass &&
            (Object.getPrototypeOf(toolClass) === ToolDefinitionTemplate ||
                toolClass.prototype instanceof ToolDefinitionTemplate ||
                (ToolDefinitionTemplate.isPrototypeOf &&
                    ToolDefinitionTemplate.isPrototypeOf(toolClass)))
        );
    }
}
