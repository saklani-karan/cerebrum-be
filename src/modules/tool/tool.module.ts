import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tool } from './tool.entity';
import { ToolService } from './tool.service';

@Module({
    imports: [TypeOrmModule.forFeature([Tool])],
    providers: [ToolService],
    exports: [ToolService],
})
export class ToolModule {}
