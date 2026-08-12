import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { Role } from '../../modules/crm/enums';
import { getAuthTokenFromRequest } from '../auth/cookies';
import { requestContext } from '../context/request-context';

/**
 * Populates the per-request async context with the authenticated user's id
 * and role so that TypeORM subscribers (audit records) and the scoped query
 * service can attribute/scope requests to the acting user. Requests without
 * a valid token simply get `userId: null`, `role: null`.
 */
@Injectable()
export class UserContextMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) {}

    use(req: Request, _res: Response, next: NextFunction): void {
        let userId: number | null = null;
        let role: Role | null = null;

        const authHeader = req.headers.authorization;
        const [scheme, token] = authHeader?.split(/\s+/) ?? [];
        // The frontend sends the token as an HttpOnly cookie; the header is
        // kept as a fallback for API clients.
        const authToken =
            getAuthTokenFromRequest(req) ??
            (scheme === 'Bearer' ? token : undefined);

        if (authToken) {
            try {
                const payload = this.jwtService.verify<{
                    sub: number;
                    role?: Role;
                }>(authToken);
                userId = Number(payload.sub) || null;
                if (Object.values(Role).includes(payload.role as Role)) {
                    role = payload.role as Role;
                }
            } catch {
                // Invalid tokens are handled by the JWT guard; here we only
                // care about capturing a valid user for audit attribution.
            }
        }

        requestContext.run({ userId, role }, next);
    }
}
