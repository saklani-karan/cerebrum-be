import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateIntegration {
    @IsString()
    @IsNotEmpty()
    key: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsUrl()
    iconUrl: string;
}
