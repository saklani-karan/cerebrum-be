import { AssistantService } from '@modules/assistant/assistant.service';
import { CreateAssistantRequest } from '@modules/assistant/types/create-assistant';
import { UpdateAssistantRequest } from '@modules/assistant/types/update-assistant';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';

@Controller('/assistant')
export class AssistantController {
    constructor(private readonly assistantService: AssistantService) {}

    @Post('/')
    create(@Body() request: CreateAssistantRequest) {
        return this.assistantService.create(request);
    }

    @Put('/:id')
    update(@Param('id') id: string, @Body() request: UpdateAssistantRequest) {
        return this.assistantService.update(id, request);
    }

    @Delete('/:id')
    delete(@Param('id') id: string) {
        return this.assistantService.remove(id);
    }

    @Get('/:id')
    get(@Param('id') id: string) {
        return this.assistantService.get(id);
    }
}
