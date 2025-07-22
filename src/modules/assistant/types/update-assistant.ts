import { IsOptional, IsString } from 'class-validator';

export class UpdateAssistantRequest {
    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    description: string;
}
