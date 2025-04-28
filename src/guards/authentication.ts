import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '@modules/user/user.service';
import { IsPublic } from '@decorators/authentication';
import { Reflector } from '@nestjs/core';
import { User } from '@modules/user/user.entity';
@Injectable()
export class AppAuthenticationGuard implements CanActivate {
    constructor(
        private readonly userService: UserService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        const isPublic = new IsPublic(context, this.reflector).get();
        if (isPublic) {
            return true;
        }

        const user = await this.userService.get(request.session.userId);
        if (!user) {
            throw new UnauthorizedException();
        }

        request.user = user;
        return true;
    }
}
