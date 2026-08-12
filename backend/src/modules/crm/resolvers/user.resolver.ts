import { Resolver } from '@nestjs/graphql';
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { User } from '../entities/user.entity';
import { UserUpdateInput } from '../inputs';

@Resolver(() => User)
export class UserResolver extends CRUDResolver(User, {
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.OFFSET,
    // Allow the frontend's un-paged `mode: "off"` list fetches.
    read: { maxResultsSize: -1 },
    UpdateDTOClass: UserUpdateInput,
    create: { one: { disabled: true }, many: { disabled: true } },
    update: { many: { disabled: true } },
    delete: { many: { disabled: true } },
    // Raw aggregate endpoints would leak cross-user stats.
    aggregate: { enabled: false },
}) {
    constructor(
        @InjectQueryService(User) readonly service: QueryService<User>,
    ) {
        super(service);
    }
}
