import { Resolver } from '@nestjs/graphql';
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { TaskStage } from '../entities/task-stage.entity';

@Resolver(() => TaskStage)
export class TaskStageResolver extends CRUDResolver(TaskStage, {
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.OFFSET,
    // Allow the frontend's un-paged `mode: "off"` list fetches.
    read: { maxResultsSize: -1 },
    create: { one: { disabled: true }, many: { disabled: true } },
    update: { one: { disabled: true }, many: { disabled: true } },
    delete: { one: { disabled: true }, many: { disabled: true } },
}) {
    constructor(
        @InjectQueryService(TaskStage)
        readonly service: QueryService<TaskStage>,
    ) {
        super(service);
    }
}
