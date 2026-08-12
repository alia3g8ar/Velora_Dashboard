import { Resolver } from '@nestjs/graphql';
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { Deal } from '../entities/deal.entity';
import { DealCreateInput, DealUpdateInput } from '../inputs';

@Resolver(() => Deal)
export class DealResolver extends CRUDResolver(Deal, {
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.OFFSET,
    // Allow the frontend's un-paged `mode: "off"` list fetches.
    read: { maxResultsSize: -1 },
    CreateDTOClass: DealCreateInput,
    UpdateDTOClass: DealUpdateInput,
    create: { many: { disabled: true } },
    update: { many: { disabled: true } },
    delete: { many: { disabled: true } },
    // Raw aggregate endpoints would leak cross-user stats.
    aggregate: { enabled: false },
}) {
    constructor(
        @InjectQueryService(Deal) readonly service: QueryService<Deal>,
    ) {
        super(service);
    }
}
