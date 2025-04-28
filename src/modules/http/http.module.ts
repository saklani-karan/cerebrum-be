import { HttpModule as HttpModuleAxios } from '@nestjs/axios';
import { Module, Global } from '@nestjs/common';

@Global()
@Module({
    imports: [HttpModuleAxios],
    providers: [],
    exports: [HttpModuleAxios],
})
export class HttpModule {}
