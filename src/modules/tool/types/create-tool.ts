import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateTool {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    action: string;

    @IsObject()
    @IsNotEmpty()
    userParams: Record<string, any>;

    @IsObject()
    @IsNotEmpty()
    workflowParams: Record<string, any>;

    @IsString()
    @IsNotEmpty()
    integrationKey: string;
}
