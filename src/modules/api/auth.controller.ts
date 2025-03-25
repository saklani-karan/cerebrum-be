import { AuthService } from '@modules/auth/auth.service';
import { LocalStrategy } from '@modules/strategies/auth/local';
import { SIGN_UP_STRATEGY } from '@modules/strategies/sign-up';
import { SignUpRequest, SignUpStrategyInterface } from '@modules/strategies/sign-up/types';
import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        @Inject(SIGN_UP_STRATEGY)
        private readonly signUpStrategy: SignUpStrategyInterface,
    ) {}

    @Post('/login')
    @UseGuards(AuthGuard(LocalStrategy.provider))
    login() {
        return this.authService.sign();
    }

    @Post('/logout')
    logout() {
        return this.authService.logout();
    }

    @Post('/sign-up')
    signUp(@Body() request: SignUpRequest) {
        return this.signUpStrategy.exec(request);
    }

    @Get('/me')
    me() {
        return this.authService.me();
    }
}
