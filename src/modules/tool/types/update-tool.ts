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
    params?: Record<string, any>;
}
