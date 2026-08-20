import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthJwtService } from 'src/services/auth-service/jwt.service';

@Injectable()
export class JwtAuthGuard {
    constructor(
        private readonly jwtService: AuthJwtService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Access token not found');
        }

        try {
            const payload = await this.jwtService.verifyAccessToken(token);
            request.user = payload;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
