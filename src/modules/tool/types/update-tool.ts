import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class UpdateTool {
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsString()
    @IsNotEmpty()
    description?: string;

    @IsObject()
    @IsNotEmpty()
    userParams?: Record<string, any>;

    @IsObject()
    @IsNotEmpty()
    workflowParams?: Record<string, any>;
}
