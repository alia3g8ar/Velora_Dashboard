import {
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import {
    getQueryServiceToken,
    mergeFilter,
    mergeQuery,
    ProxyQueryService,
    type AggregateOptions,
    type AggregateQuery,
    type AggregateResponse,
    type CountOptions,
    type DeepPartial,
    type DeleteManyResponse,
    type DeleteOneOptions,
    type Filter,
    type FindByIdOptions,
    type GetByIdOptions,
    type ModifyRelationOptions,
    type Query,
    type QueryOptions,
    type QueryService,
    type UpdateManyResponse,
    type UpdateOneOptions,
} from '@ptc-org/nestjs-query-core';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import type {
    DataSource,
    EntityTarget,
    FindOptionsWhere,
    ObjectLiteral,
} from 'typeorm';
import { getRequestContext } from '../../../common/context/request-context';
import { Role } from '../enums';
import { Audit } from '../entities/audit.entity';
import { Company } from '../entities/company.entity';
import { Contact } from '../entities/contact.entity';
import { Deal } from '../entities/deal.entity';
import { Event } from '../entities/event.entity';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';

/**
 * Per-user data isolation for the generated CRUD endpoints.
 *
 * The library's `ctx.hooks` mechanism (used by `@BeforeQueryMany` /
 * `@BeforeFindOne`) is fundamentally racy: the `HookInterceptor` writes the
 * hook chain for a field onto the SHARED request context, but the `HookArgs`
 * parameter decorator reads it several microtasks later — after every other
 * field of the same GraphQL operation has already overwritten it. With
 * several list/count fields in one operation (e.g. the dashboard totals
 * query), every field ends up scoped by the LAST field's hook, leaking its
 * filter into all counts.
 *
 * Instead of hooks, every read and mutation is routed through a
 * `ScopedQueryService` that reads the acting user from the per-request async
 * context (AsyncLocalStorage) at call time. There is no shared mutable
 * state, so concurrent fields cannot interfere:
 *
 *  - `query` / `count` / `aggregate` merge the ownership filter into the SQL.
 *  - `findById` / `getById` scope the lookup (foreign rows surface as "not
 *    found", without revealing their existence).
 *  - Relation reads funnel through the relation entity's scoped service, so
 *    nested data (contacts of a company, deals of a stage, ...) is scoped too.
 *  - `createOne` forces the owner field and validates referenced parents;
 *    `updateOne`/`deleteOne` verify the target row is owned and strip
 *    server-managed fields.
 */

/** The id of the authenticated user for the current async context. */
const currentUserId = (): number => {
    const id = getRequestContext().userId;
    if (!id) {
        throw new UnauthorizedException('Not authenticated');
    }
    return id;
};

/**
 * ADMIN is exempt from per-user isolation: it sees (and manages) the full
 * dataset, while the owner selects exclude admin accounts in the UI.
 */
const isAdmin = (): boolean => getRequestContext().role === Role.ADMIN;

const assertOwned = (owned: boolean, what: string): void => {
    if (!owned) {
        throw new ForbiddenException(`You do not have access to this ${what}`);
    }
};

/**
 * Parent references are validated against the actor's ownership — except for
 * ADMIN, who sees every row and may attach children to any of them.
 */
const assertOwnedOrAdmin = (owned: boolean, what: string): void => {
    if (!isAdmin()) {
        assertOwned(owned, what);
    }
};

/**
 * Per-entity ownership behaviour.
 *
 * `ownerField` is the column that ties a row to its owner (for the `User`
 * entity it is simply `id`). `prepareCreate`/`prepareUpdate` run before the
 * proxied service writes: they force the owner field, strip server-managed
 * fields from updates, and reject references to another user's rows.
 */
export interface ScopedRules<T extends ObjectLiteral> {
    label: string;
    ownerField: keyof T & string;
    prepareCreate?: (
        input: Record<string, unknown>,
        userId: number,
        dataSource: DataSource,
    ) => void | Promise<void>;
    prepareUpdate?: (
        update: Record<string, unknown>,
        userId: number,
        dataSource: DataSource,
    ) => void | Promise<void>;
}

const companyRules: ScopedRules<Company> = {
    label: 'Company',
    ownerField: 'salesOwnerId',
    prepareCreate: (input, userId) => {
        input.salesOwnerId = userId;
    },
    prepareUpdate: (update) => {
        // The owner field is server-managed; a row can never be handed to
        // another user (which would both hide it and expose it to someone).
        delete update.salesOwnerId;
    },
};

const contactRules: ScopedRules<Contact> = {
    label: 'Contact',
    ownerField: 'salesOwnerId',
    prepareCreate: async (input, userId, dataSource) => {
        assertOwnedOrAdmin(
            await dataSource.getRepository(Company).existsBy({
                id: Number(input.companyId),
                salesOwnerId: userId,
            }),
            'company',
        );
        input.salesOwnerId = userId;
    },
    prepareUpdate: async (update, userId, dataSource) => {
        delete update.salesOwnerId;
        if (update.companyId != null) {
            assertOwnedOrAdmin(
                await dataSource.getRepository(Company).existsBy({
                    id: Number(update.companyId),
                    salesOwnerId: userId,
                }),
                'company',
            );
        }
    },
};

const dealRules: ScopedRules<Deal> = {
    label: 'Deal',
    ownerField: 'dealOwnerId',
    prepareCreate: async (input, userId, dataSource) => {
        assertOwnedOrAdmin(
            await dataSource.getRepository(Company).existsBy({
                id: Number(input.companyId),
                salesOwnerId: userId,
            }),
            'company',
        );
        if (input.dealContactId != null) {
            assertOwnedOrAdmin(
                await dataSource.getRepository(Contact).existsBy({
                    id: Number(input.dealContactId),
                    salesOwnerId: userId,
                }),
                'contact',
            );
        }
        input.dealOwnerId = userId;
    },
    prepareUpdate: async (update, userId, dataSource) => {
        delete update.dealOwnerId;
        if (update.companyId != null) {
            assertOwnedOrAdmin(
                await dataSource.getRepository(Company).existsBy({
                    id: Number(update.companyId),
                    salesOwnerId: userId,
                }),
                'company',
            );
        }
        if (update.dealContactId != null) {
            assertOwnedOrAdmin(
                await dataSource.getRepository(Contact).existsBy({
                    id: Number(update.dealContactId),
                    salesOwnerId: userId,
                }),
                'contact',
            );
        }
    },
};

const taskRules: ScopedRules<Task> = {
    label: 'Task',
    ownerField: 'createdByUserId',
};

const eventRules: ScopedRules<Event> = {
    label: 'Event',
    ownerField: 'createdByUserId',
};

const auditRules: ScopedRules<Audit> = {
    label: 'Audit',
    ownerField: 'userId',
};

const userRules: ScopedRules<User> = {
    label: 'User',
    ownerField: 'id',
    prepareUpdate: (update) => {
        // Never allow a user to escalate their own role.
        delete update.role;
    },
};

export const scopedRules = {
    Company: companyRules,
    Contact: contactRules,
    Deal: dealRules,
    Task: taskRules,
    Event: eventRules,
    Audit: auditRules,
    User: userRules,
};

type DeepPartialRecord = Record<string, unknown>;

/**
 * Wraps the plain TypeORM query service with ownership enforcement. All reads
 * are merged with the acting user's scope; all writes verify/force ownership.
 * No request-scoped state is held on the instance — the user is read from the
 * async context per call — so concurrent GraphQL fields are race-free.
 */
export class ScopedQueryService<
    T extends ObjectLiteral,
    C = DeepPartial<T>,
    U = DeepPartial<T>,
> extends ProxyQueryService<T, C, U> {
    constructor(
        proxied: QueryService<T, C, U>,
        private readonly rules: ScopedRules<T>,
        private readonly dataSource: DataSource,
        private readonly entity: EntityTarget<T>,
    ) {
        super(proxied);
    }

    private ownedBy(): Filter<T> {
        if (isAdmin()) {
            return {};
        }
        // Computed keys widen to `{[x: string]: ...}`, so the cast is
        // required — tsc rejects the literal against `Filter<T>` directly.
        return {
            [this.rules.ownerField]: { eq: currentUserId() },
        } as Filter<T>;
    }

    private ownedByWhere(): FindOptionsWhere<T> {
        if (isAdmin()) {
            return {};
        }
        return {
            [this.rules.ownerField]: currentUserId(),
        } as FindOptionsWhere<T>;
    }

    private async verifyOwned(id: string | number): Promise<void> {
        const owned = await this.dataSource
            .getRepository(this.entity)
            .existsBy({
                ...this.ownedByWhere(),
                id: Number(id),
            });
        if (!owned) {
            throw new NotFoundException(
                `Unable to find ${this.rules.label} with id: ${id}`,
            );
        }
    }

    // ---------------------------------------------------------------------
    // Reads
    // ---------------------------------------------------------------------

    query(query: Query<T>, opts?: QueryOptions<T>): Promise<T[]> {
        return this.proxied.query(
            mergeQuery(query, { filter: this.ownedBy() }),
            opts,
        );
    }

    count(filter: Filter<T>, opts?: CountOptions): Promise<number> {
        return this.proxied.count(
            mergeFilter(filter ?? {}, this.ownedBy()),
            opts,
        );
    }

    aggregate(
        filter: Filter<T>,
        aggregate: AggregateQuery<T>,
        opts?: AggregateOptions,
    ): Promise<AggregateResponse<T>[]> {
        return this.proxied.aggregate(
            mergeFilter(filter ?? {}, this.ownedBy()),
            aggregate,
            opts,
        );
    }

    findById(
        id: string | number,
        opts?: FindByIdOptions<T>,
    ): Promise<T | undefined> {
        return this.proxied.findById(id, {
            ...opts,
            filter: mergeFilter(opts?.filter ?? {}, this.ownedBy()),
        });
    }

    getById(id: string | number, opts?: GetByIdOptions<T>): Promise<T> {
        return this.proxied.getById(id, {
            ...opts,
            filter: mergeFilter(opts?.filter ?? {}, this.ownedBy()),
        });
    }

    // ---------------------------------------------------------------------
    // Writes
    // ---------------------------------------------------------------------

    async createOne(item: C): Promise<T> {
        const userId = currentUserId();
        await this.rules.prepareCreate?.(
            item as unknown as DeepPartialRecord,
            userId,
            this.dataSource,
        );
        return this.proxied.createOne(item);
    }

    async createMany(items: C[]): Promise<T[]> {
        const userId = currentUserId();
        for (const item of items) {
            await this.rules.prepareCreate?.(
                item as unknown as DeepPartialRecord,
                userId,
                this.dataSource,
            );
        }
        return this.proxied.createMany(items);
    }

    async updateOne(
        id: string | number,
        update: U,
        opts?: UpdateOneOptions<T>,
    ): Promise<T> {
        await this.verifyOwned(id);
        await this.rules.prepareUpdate?.(
            update as unknown as DeepPartialRecord,
            currentUserId(),
            this.dataSource,
        );
        return this.proxied.updateOne(id, update, opts);
    }

    async updateMany(
        update: U,
        filter: Filter<T>,
    ): Promise<UpdateManyResponse> {
        await this.rules.prepareUpdate?.(
            update as unknown as DeepPartialRecord,
            currentUserId(),
            this.dataSource,
        );
        return this.proxied.updateMany(
            update,
            mergeFilter(filter ?? {}, this.ownedBy()),
        );
    }

    async deleteOne(
        id: string | number,
        opts?: DeleteOneOptions<T>,
    ): Promise<T> {
        await this.verifyOwned(id);
        return this.proxied.deleteOne(id, opts);
    }

    async deleteMany(filter: Filter<T>): Promise<DeleteManyResponse> {
        return this.proxied.deleteMany(
            mergeFilter(filter ?? {}, this.ownedBy()),
        );
    }

    // ---------------------------------------------------------------------
    // Relation mutations (guarded for defense in depth; not exposed in the
    // current schema).
    // ---------------------------------------------------------------------

    addRelations<Relation>(
        relationName: string,
        id: string | number,
        relationIds: (string | number)[],
        opts?: ModifyRelationOptions<T, Relation>,
    ): Promise<T> {
        return this.verifyOwned(id).then(() =>
            this.proxied.addRelations(relationName, id, relationIds, opts),
        );
    }

    setRelations<Relation>(
        relationName: string,
        id: string | number,
        relationIds: (string | number)[],
        opts?: ModifyRelationOptions<T, Relation>,
    ): Promise<T> {
        return this.verifyOwned(id).then(() =>
            this.proxied.setRelations(relationName, id, relationIds, opts),
        );
    }

    setRelation<Relation>(
        relationName: string,
        id: string | number,
        relationId: string | number,
        opts?: ModifyRelationOptions<T, Relation>,
    ): Promise<T> {
        return this.verifyOwned(id).then(() =>
            this.proxied.setRelation(relationName, id, relationId, opts),
        );
    }

    removeRelations<Relation>(
        relationName: string,
        id: string | number,
        relationIds: (string | number)[],
        opts?: ModifyRelationOptions<T, Relation>,
    ): Promise<T> {
        return this.verifyOwned(id).then(() =>
            this.proxied.removeRelations(relationName, id, relationIds, opts),
        );
    }

    removeRelation<Relation>(
        relationName: string,
        id: string | number,
        relationId: string | number,
        opts?: ModifyRelationOptions<T, Relation>,
    ): Promise<T> {
        return this.verifyOwned(id).then(() =>
            this.proxied.removeRelation(relationName, id, relationId, opts),
        );
    }
}

/**
 * NestJS provider that replaces the plain `QueryService` for an entity with a
 * scoped wrapper. Local module providers take precedence over the ones
 * registered by `NestjsQueryTypeOrmModule.forFeature`, so every
 * `@InjectQueryService(Entity)` (CRUD resolvers, relation services, ...)
 * receives the scoped instance.
 */
export const scopedQueryServiceProvider = <T extends ObjectLiteral>(
    entity: EntityTarget<T> & { name: string },
    rules: ScopedRules<T>,
) => ({
    provide: getQueryServiceToken(entity),
    useFactory: (dataSource: DataSource) =>
        new ScopedQueryService<T>(
            new TypeOrmQueryService(dataSource.getRepository(entity)),
            rules,
            dataSource,
            entity,
        ),
    inject: [getDataSourceToken()],
});
