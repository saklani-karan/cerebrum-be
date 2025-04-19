import { Controller, Post, Body } from '@nestjs/common';
import { IntegrationLibraryService } from './integration-library.service';

@Controller('integration-library')
export class IntegrationLibraryController {
    constructor(private readonly integrationLibraryService: IntegrationLibraryService) {}

    @Post('/')
    async execute(@Body() body: { key: string; action: string; params: any }) {
        return this.integrationLibraryService.execute(body.key, body.action, body.params);
    }
}
