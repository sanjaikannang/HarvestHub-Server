import { Request } from 'express';
import { RoleGuard } from 'src/guards/role.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AuthService } from 'src/services/auth-service/auth.service';
import { UpdateLanguageRequest } from './update-language.request';
import { UpdateLanguageResponse } from './update-language.response';
import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';

// Any authenticated role — the language selector applies to every screen
// (see modules/12-localization/requirement.md)
@Controller('auth')
export class UpdateLanguageController {
    constructor(private readonly authService: AuthService) { }

    @Patch('update-language')
    @UseGuards(JwtAuthGuard, RoleGuard)
    async updateLanguage(@Body() body: UpdateLanguageRequest, @Req() req: Request): Promise<UpdateLanguageResponse> {
        const userId = (req as any).user.sub;
        const data = await this.authService.updateLanguageAPI(userId, body.preferredLanguage);

        return {
            success: true,
            message: 'Language preference updated successfully',
            data,
        };
    }
}
