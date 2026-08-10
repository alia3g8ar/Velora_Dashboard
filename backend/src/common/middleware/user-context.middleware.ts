import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { requestContext } from '../context/request-context';

/**
 * Populates the per-request async context with the authenticated user id so
 * that TypeORM subscribers (audit records) can attribute changes to the
 * acting user. Requests without a valid token simply get `userId: null`.
 */
@Injectable()
export class UserContextMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) {}

    use(req: Request, _res: Response, next: NextFunction): void {
        let userId: number | null = null;

        const authHeader = req.headers.authorization;
        const [scheme, token] = authHeader?.split(/\s+/) ?? [];

        if (scheme === 'Bearer' && token) {
            try {
                const payload = this.jwtService.verify<{ sub: number }>(token);
                userId = Number(payload.sub) || null;
            } catch {
                // Invalid tokens are handled by the JWT guard; here we only
                // care about capturing a valid user for audit attribution.
            }
        }

        requestContext.run({ userId }, next);
    }
}
