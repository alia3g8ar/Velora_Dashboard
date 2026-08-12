import { AsyncLocalStorage } from 'node:async_hooks';
import { Role } from '../../modules/crm/enums';

export type RequestContext = {
    userId: number | null;
    role: Role | null;
};

/**
 * Per-request storage that carries the id and role of the authenticated user.
 *
 * A NestJS middleware populates the store for every incoming request and
 * TypeORM subscribers (e.g. the audit subscriber) read it later in the same
 * async context to attribute records to the acting user. The scoped query
 * service also reads it: ADMIN users are exempt from per-user isolation.
 */
export const requestContext = new AsyncLocalStorage<RequestContext>();

export const getRequestContext = (): RequestContext => ({
    userId: requestContext.getStore()?.userId ?? null,
    role: requestContext.getStore()?.role ?? null,
});
