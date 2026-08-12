import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { getAuthTokenFromRequest } from '../auth/cookies';
import { PUBLIC_KEY } from '../decorators/public.decorator';

export type AuthenticatedRequest = Request & {
    user?: {
        sub: number;
        role?: string;
    };
};

/**
 * Protects every operation with a JWT access token, except handlers marked
 * with @IsPublic (e.g. login/logout and the public avatar image endpoint).
 *
 * The token is read from the same-origin `velora_token` HttpOnly cookie first
 * (the transport the frontend uses), and falls back to the Authorization
 * header so API clients and the playground keep working.
 *
 * It handles both GraphQL resolvers and REST controller routes. Throwing
 * UnauthorizedException in GraphQL produces `extensions.code ===
 * 'UNAUTHENTICATED'`, the contract the frontend's data provider relies on to
 * log the user out.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        if (this.isPublic(context)) {
            return true;
        }

        const request = this.getRequest(context);

        if (!request) {
            throw new UnauthorizedException('Invalid request');
        }

        const token = this.extractToken(request);

        try {
            const payload = this.jwtService.verify<{
                sub: number;
                role?: string;
            }>(token);
            request.user = { sub: Number(payload.sub), role: payload.role };
            return true;
        } catch {
            throw new UnauthorizedException('Invalid or expired access token');
        }
    }

    private isPublic(context: ExecutionContext): boolean {
        return this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
    }

    private getRequest(context: ExecutionContext): AuthenticatedRequest | null {
        if (context.getType<string>() === 'graphql') {
            return GqlExecutionContext.create(context).getContext<{
                req: AuthenticatedRequest;
            }>().req;
        }

        return context.switchToHttp().getRequest<AuthenticatedRequest>();
    }

    private extractToken(request: Request): string {
        const cookieToken = getAuthTokenFromRequest(request);

        if (cookieToken) {
            return cookieToken;
        }

        const authHeader = request.headers.authorization;
        const [scheme, token, extraPart] = authHeader?.split(/\s+/) ?? [];

        if (scheme === 'Bearer' && token && !extraPart) {
            return token;
        }

        throw new UnauthorizedException('Invalid or expired access token');
    }
}
