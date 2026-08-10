import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PUBLIC_KEY } from '../decorators/public.decorator';

export type AuthenticatedRequest = Request & {
    user?: {
        sub: number;
        role?: string;
    };
};

/**
 * Protects every GraphQL operation with a JWT access token, except resolvers
 * marked with @IsPublic (e.g. login).
 *
 * Throwing UnauthorizedException produces a GraphQL error with
 * `extensions.code === 'UNAUTHENTICATED'`, which is the contract the
 * frontend's data provider relies on to log the user out.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const gqlContext = GqlExecutionContext.create(context);
        const request = gqlContext.getContext<{
            req: AuthenticatedRequest;
        }>().req;
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

    private extractToken(request: Request): string {
        const authHeader = request.headers.authorization;
        const [scheme, token, extraPart] = authHeader?.split(/\s+/) ?? [];

        if (scheme !== 'Bearer' || !token || extraPart) {
            throw new UnauthorizedException('Invalid or expired access token');
        }

        return token;
    }
}
