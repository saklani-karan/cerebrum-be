import { SetMetadata, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export class IsPublic {
    private static readonly key: Symbol = Symbol('isPublic');
    constructor(
        private readonly context: ExecutionContext,
        private readonly reflector: Reflector,
    ) {}

    static set() {
        return SetMetadata(IsPublic.key, true);
    }

    get(): boolean {
        return this.reflector.get<boolean>(IsPublic.key, this.context.getHandler());
    }
}
