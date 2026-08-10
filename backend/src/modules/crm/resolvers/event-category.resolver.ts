import { Resolver } from '@nestjs/graphql';
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { EventCategory } from '../entities/event-category.entity';

@Resolver(() => EventCategory)
export class EventCategoryResolver extends CRUDResolver(EventCategory, {
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.OFFSET,
    // Allow the frontend's un-paged `mode: "off"` list fetches.
    read: { maxResultsSize: -1 },
    create: { one: { disabled: true }, many: { disabled: true } },
    update: { one: { disabled: true }, many: { disabled: true } },
    delete: { one: { disabled: true }, many: { disabled: true } },
}) {
    constructor(
        @InjectQueryService(EventCategory)
        readonly service: QueryService<EventCategory>,
    ) {
        super(service);
    }
}
