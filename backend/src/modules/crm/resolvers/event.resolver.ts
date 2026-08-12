import { Resolver } from '@nestjs/graphql';
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { Event } from '../entities/event.entity';
import { EventCreateInput, EventUpdateInput } from '../inputs';

@Resolver(() => Event)
export class EventResolver extends CRUDResolver(Event, {
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.OFFSET,
    // Allow the frontend's un-paged `mode: "off"` list fetches.
    read: { maxResultsSize: -1 },
    // Single-item create/update/delete are enabled so users can manage their
    // own events from the dashboard; ownership is enforced by the scoped
    // query service (creator is always the owner). The explicit DTO classes
    // keep id/createdAt/updatedAt out of the inputs (the server manages them).
    CreateDTOClass: EventCreateInput,
    UpdateDTOClass: EventUpdateInput,
    create: { one: { disabled: false }, many: { disabled: true } },
    update: { one: { disabled: false }, many: { disabled: true } },
    delete: { one: { disabled: false }, many: { disabled: true } },
    // Raw aggregate endpoints would leak cross-user stats.
    aggregate: { enabled: false },
}) {
    constructor(
        @InjectQueryService(Event) readonly service: QueryService<Event>,
    ) {
        super(service);
    }
}
