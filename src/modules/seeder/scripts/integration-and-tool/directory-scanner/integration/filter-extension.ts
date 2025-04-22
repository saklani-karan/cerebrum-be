import { FilterFileExtensionInterface } from '@utils/scan-directory';

export class SeederIntegrationFilterExtension implements FilterFileExtensionInterface {
    exec(filePath: string): boolean {
        return (
            filePath.endsWith('integration.js') &&
            !filePath.includes('.test.js') &&
            !filePath.includes('.map.js')
        );
    }
}
