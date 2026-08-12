import { UnauthorizedException } from '@nestjs/common';

/**
 * The JwtAuthGuard attaches the verified token payload to the GraphQL
 * request context (`context.req.user`). This returns that user id, refusing
 * to proceed when it is missing — which would indicate a misconfigured
 * unauthenticated path rather than a real request.
 */
export const getCurrentUserId = (context: unknown): number => {
    const userId = (context as { req?: { user?: { sub?: number } } })?.req?.user
        ?.sub;
    if (!userId) {
        throw new UnauthorizedException('Not authenticated');
    }
    return userId;
};
