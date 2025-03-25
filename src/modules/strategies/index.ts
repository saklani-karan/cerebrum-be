import { AuthStrategyModule } from './auth/module';
import { SignPasswordStrategyModule } from './sign-password/module';
import { SignUpStrategyModule } from './sign-up/module';

export const StrategyModules = [
  SignUpStrategyModule,
  SignPasswordStrategyModule,
  AuthStrategyModule,
];
