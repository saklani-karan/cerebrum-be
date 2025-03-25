import { AuthConfigModule } from '@modules/auth-config/auth-config.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OAuthGuard } from './guards/oauth-guard';

@Module({
  imports: [UserModule, AuthConfigModule],
  providers: [OAuthGuard, AuthService],
  controllers: [],
  exports: [AuthService, OAuthGuard],
})
export class AuthModule {}
