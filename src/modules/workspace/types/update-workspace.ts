import { IsString, IsOptional } from 'class-validator';

export class UpdateWorkspace {
    @IsString()
    @IsOptional()
    name?: string;
}
