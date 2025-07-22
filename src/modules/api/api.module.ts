import { AuthModule } from '@modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { OAuthController } from './oauth.controller';
import { IntegrationAuthController } from './integration-auth.controller';
import { IntegrationAuthModule } from '@modules/integration-auth/integration-auth.module';
import { AssistantModule } from '@modules/assistant/assistant.module';
import { AssistantController } from './assistant.controller';
@Module({
    imports: [AuthModule, IntegrationAuthModule, AssistantModule],
    controllers: [AuthController, OAuthController, IntegrationAuthController, AssistantController],
})
export class ApiModule {}
