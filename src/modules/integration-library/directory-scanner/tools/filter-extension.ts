import { FilterFileExtensionInterface } from '@utils/scan-directory';

export class ToolFilterExtension implements FilterFileExtensionInterface {
    exec(filePath: string): boolean {
        return (
            filePath.endsWith('.tool.js') &&
            !filePath.includes('.test.js') &&
            !filePath.includes('.map.js')
        );
    }
}
