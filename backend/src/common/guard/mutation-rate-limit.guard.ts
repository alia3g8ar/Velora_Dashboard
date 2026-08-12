import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { OperationTypeNode, type GraphQLResolveInfo } from 'graphql';
import type { Request } from 'express';

/**
 * Sliding-window rate limiter that only throttles GraphQL *mutations*.
 *
 * Reads (queries) are left untouched so page loads — which issue many
 * queries back-to-back — are never blocked. Write operations are capped at
 * `RATE_LIMIT_MAX_PER_WINDOW` within `RATE_LIMIT_WINDOW_MS` per IP, which
 * prevents a script from bulk-inserting thousands of records (e.g. deals or
 * companies) through the API. The counters live in process memory, matching
 * the demo runtime where the app periodically restarts / reseeds anyway.
 */
@Injectable()
export class MutationRateLimitGuard implements CanActivate {
    private readonly logger = new Logger(MutationRateLimitGuard.name);
    private readonly requestLog = new Map<string, number[]>();
    private readonly maxMutations: number;
    private readonly windowMs: number;
    private lastPrune = Date.now();

    constructor(config: ConfigService) {
        this.maxMutations = Math.max(
            1,
            Number(config.get<string>('RATE_LIMIT_MAX_PER_WINDOW', '3')),
        );
        this.windowMs = Math.max(
            1,
            Number(config.get<string>('RATE_LIMIT_WINDOW_MS', '5000')),
        );
    }

    canActivate(context: ExecutionContext): boolean {
        if (context.getType<string>() !== 'graphql') {
            // REST routes (e.g. image uploads) are not part of the GraphQL
            // mutation surface and are bounded by their own limits instead.
            return true;
        }

        const gqlContext = GqlExecutionContext.create(context);
        const info = gqlContext.getInfo<GraphQLResolveInfo>();
        const request = gqlContext.getContext<{ req: Request }>().req;

        if (info.operation.operation !== OperationTypeNode.MUTATION) {
            return true;
        }

        // Logging out writes no records; exempting it keeps the session
        // cookie always clearable even when the mutation budget is spent.
        if (info.fieldName === 'logout') {
            return true;
        }

        const key = `mutation:${request.ip ?? 'unknown'}`;
        const now = Date.now();
        const recent = (this.requestLog.get(key) ?? []).filter(
            (timestamp) => now - timestamp < this.windowMs,
        );

        if (recent.length >= this.maxMutations) {
            this.logger.warn(
                `Mutation rate limit hit for ${request.ip ?? 'unknown'}`,
            );
            throw new HttpException(
                'Too many write requests. Please slow down and try again.',
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        recent.push(now);
        this.requestLog.set(key, recent);
        this.pruneStale(now);

        return true;
    }

    private pruneStale(now: number): void {
        if (now - this.lastPrune < 5 * 60 * 1000) {
            return;
        }

        this.lastPrune = now;

        for (const [key, timestamps] of this.requestLog) {
            if (timestamps.every((ts) => now - ts >= this.windowMs)) {
                this.requestLog.delete(key);
            }
        }
    }
}
