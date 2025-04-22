import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { Provider } from '@nestjs/common';

export interface FilterFileExtensionInterface {
    exec(filePath: string): boolean;
}

export interface FilteredClassReducerInterface<AggregateType> {
    exec(exports: any, aggregator: AggregateType[]): AggregateType[];
}

export class ScanDirectoryStrategy<T> {
    protected filterFileExtension: FilterFileExtensionInterface;
    protected filteredClassReducer: FilteredClassReducerInterface<T>;

    constructor(
        filterFileExtension: FilterFileExtensionInterface,
        filteredClassReducer: FilteredClassReducerInterface<T>,
    ) {
        this.filterFileExtension = filterFileExtension;
        this.filteredClassReducer = filteredClassReducer;
    }

    scan(dir: string): T[] {
        const aggregator: T[] = [];
        this.scanDirectory(dir, aggregator);
        return aggregator;
    }

    private scanDirectory(dir: string, aggregator: T[]): void {
        const files = readdirSync(dir);
        files.forEach((file) => {
            const filePath = join(dir, file);
            const stats = statSync(filePath);
            if (stats.isDirectory()) {
                this.scanDirectory(filePath, aggregator);
                return;
            }

            if (!this.filterFileExtension.exec(file)) {
                return;
            }
            const exports = require(`${filePath}`);

            this.filteredClassReducer.exec(exports, aggregator);
        });
    }
}

export class ScanDirectoryStrategyBuilder<T> {
    private filterFileExtension_: FilterFileExtensionInterface;
    private filteredClassReducer_: FilteredClassReducerInterface<T>;

    constructor() {}

    filterFileExtension(
        filterFileExtension: FilterFileExtensionInterface,
    ): ScanDirectoryStrategyBuilder<T> {
        this.filterFileExtension_ = filterFileExtension;
        return this;
    }

    filteredClassReducer(
        filteredClassReducer: FilteredClassReducerInterface<T>,
    ): ScanDirectoryStrategyBuilder<T> {
        this.filteredClassReducer_ = filteredClassReducer;
        return this;
    }

    build(): ScanDirectoryStrategy<T> {
        return new ScanDirectoryStrategy<T>(this.filterFileExtension_, this.filteredClassReducer_);
    }
}
