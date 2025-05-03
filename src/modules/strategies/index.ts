import { AuthStrategyModule } from './auth/module';
import { CreateUserStrategyModule } from './create-user/module';
import { SignPasswordStrategyModule } from './sign-password/module';
import { SignUpStrategyModule } from './sign-up/module';
import { IntegrationAuthStrategyModule } from './integration-auth/module';

export const StrategyModules = [
    SignUpStrategyModule,
    SignPasswordStrategyModule,
    AuthStrategyModule,
    CreateUserStrategyModule,
    IntegrationAuthStrategyModule,
];
