import { Module } from '@nestjs/common';
import { IntegrationAuth } from './integration-auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationAuthService } from './integration-auth.service';
@Module({
    imports: [TypeOrmModule.forFeature([IntegrationAuth])],
    providers: [IntegrationAuthService],
    exports: [IntegrationAuthService],
})
export class IntegrationAuthModule {}
