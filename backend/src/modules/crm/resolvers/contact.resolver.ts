import { Resolver } from '@nestjs/graphql';
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { Contact } from '../entities/contact.entity';

@Resolver(() => Contact)
export class ContactResolver extends CRUDResolver(Contact, {
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.OFFSET,
    // Allow the frontend's un-paged `mode: "off"` list fetches.
    read: { maxResultsSize: -1 },
    create: { one: { disabled: true }, many: { disabled: true } },
    update: { one: { disabled: true }, many: { disabled: true } },
    delete: { one: { disabled: true }, many: { disabled: true } },
}) {
    constructor(
        @InjectQueryService(Contact) readonly service: QueryService<Contact>,
    ) {
        super(service);
    }
}
