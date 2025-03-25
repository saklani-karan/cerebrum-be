import { AuthModule } from '@modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { OAuthController } from './oauth.controller';

@Module({
    imports: [AuthModule],
    controllers: [AuthController, OAuthController],
})
export class ApiModule {}
