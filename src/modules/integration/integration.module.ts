import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Integration } from './integration.entity';
import { IntegrationService } from './integration.service';

@Module({
    imports: [TypeOrmModule.forFeature([Integration])],
    providers: [IntegrationService],
    exports: [IntegrationService],
})
export class IntegrationModule {}
