import { Resolver } from '@nestjs/graphql';
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { Audit } from '../entities/audit.entity';

@Resolver(() => Audit)
export class AuditResolver extends CRUDResolver(Audit, {
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.OFFSET,
    // Allow the frontend's un-paged `mode: "off"` list fetches.
    read: { maxResultsSize: -1 },
    create: { one: { disabled: true }, many: { disabled: true } },
    update: { one: { disabled: true }, many: { disabled: true } },
    delete: { one: { disabled: true }, many: { disabled: true } },
    // Raw aggregate endpoints would leak cross-user stats.
    aggregate: { enabled: false },
}) {
    constructor(
        @InjectQueryService(Audit) readonly service: QueryService<Audit>,
    ) {
        super(service);
    }
}
