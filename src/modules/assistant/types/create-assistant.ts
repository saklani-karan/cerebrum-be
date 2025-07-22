import { IsString } from 'class-validator';

export class CreateAssistantRequest {
    @IsString()
    workspaceId: string;

    @IsString()
    name: string;

    @IsString()
    description: string;
}
