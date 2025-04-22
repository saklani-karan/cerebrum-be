import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateIntegration {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsUrl()
    @IsOptional()
    iconUrl?: string;
}
