import { AsyncLocalStorage } from 'node:async_hooks';

export type RequestContext = {
    userId: number | null;
};

/**
 * Per-request storage that carries the id of the authenticated user.
 *
 * A NestJS middleware populates the store for every incoming request and
 * TypeORM subscribers (e.g. the audit subscriber) read it later in the same
 * async context to attribute records to the acting user.
 */
export const requestContext = new AsyncLocalStorage<RequestContext>();

export const getRequestContext = (): RequestContext => ({
    userId: requestContext.getStore()?.userId ?? null,
});
