import { IsString } from 'class-validator';

export class CreateSkillRequest {
    @IsString()
    integrationKey: string;

    @IsString()
    action: string;

    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsString()
    preDefinedParams: Record<string, any>;
}
