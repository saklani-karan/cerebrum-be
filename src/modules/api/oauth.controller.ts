import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { OAuthGuard } from '../auth/guards/oauth-guard';

@Controller('/oauth')
export class OAuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/:provider/login')
    @UseGuards(OAuthGuard)
    login() {
        return;
    }

    @Get('/:provider/callback')
    @UseGuards(OAuthGuard)
    callback() {
        return this.authService.sign();
    }
}
