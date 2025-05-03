import { AuthModule } from '@modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { OAuthController } from './oauth.controller';
import { IntegrationAuthController } from './integration-auth.controller';
import { IntegrationAuthModule } from '@modules/integration-auth/integration-auth.module';
@Module({
    imports: [AuthModule, IntegrationAuthModule],
    controllers: [AuthController, OAuthController, IntegrationAuthController],
})
export class ApiModule {}
