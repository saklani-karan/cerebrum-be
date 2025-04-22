import { Provider } from '@nestjs/common';
import { ScanDirectoryStrategyBuilder } from '@utils/scan-directory';
import { IntegrationFilterExtension } from './integrations/filter-extension';
import { IntegrationFilterClassReducer } from './integrations/filter-class-reducer';
import { ToolFilterExtension } from './tools/filter-extension';
import { ToolFilterClassReducer } from './tools/filter-class-reducer';
import { join } from 'path';

export const injectProviders = (): Provider[] => {
    const directory = join(__dirname, '..', 'lib');
    const integrationInjectionStrategy = new ScanDirectoryStrategyBuilder<Provider>()
        .filterFileExtension(new IntegrationFilterExtension())
        .filteredClassReducer(new IntegrationFilterClassReducer())
        .build();

    const toolInjectionStrategy = new ScanDirectoryStrategyBuilder<Provider>()
        .filterFileExtension(new ToolFilterExtension())
        .filteredClassReducer(new ToolFilterClassReducer())
        .build();

    const integrationProviders: Provider[] = integrationInjectionStrategy.scan(directory);
    const toolProviders: Provider[] = toolInjectionStrategy.scan(directory);
    console.log('integrationProviders', integrationProviders);
    console.log('toolProviders', toolProviders);

    return [...integrationProviders, ...toolProviders];
};
