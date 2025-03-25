import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthConfig } from './auth-config.entity';
import { AuthConfigService } from './auth-config.service';

@Module({
    imports: [TypeOrmModule.forFeature([AuthConfig])],
    providers: [AuthConfigService],
    exports: [AuthConfigService],
})
export class AuthConfigModule {}
