import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DealAggregateResponse } from '../aggregates/deal-aggregate.types';
import { Deal } from '../entities/deal.entity';
import { DealStage } from '../entities/deal-stage.entity';

@Resolver(() => DealStage)
export class DealStageResolver extends CRUDResolver(DealStage, {
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.OFFSET,
    // Allow the frontend's un-paged `mode: "off"` list fetches.
    read: { maxResultsSize: -1 },
    create: { one: { disabled: true }, many: { disabled: true } },
    update: { one: { disabled: true }, many: { disabled: true } },
    delete: { one: { disabled: true }, many: { disabled: true } },
}) {
    constructor(
        @InjectQueryService(DealStage)
        readonly service: QueryService<DealStage>,
        @InjectRepository(Deal)
        private readonly dealRepository: Repository<Deal>,
    ) {
        super(service);
    }

    /**
     * Sums deal values grouped by close month/year. The dashboard's deals
     * chart calls this for the WON and LOST stages to render the area chart.
     */
    @ResolveField(() => [DealAggregateResponse])
    async dealsAggregate(
        @Parent() stage: DealStage,
    ): Promise<DealAggregateResponse[]> {
        const rows = await this.dealRepository
            .createQueryBuilder('deal')
            .select('MONTH(deal.closeDate)', 'closeDateMonth')
            .addSelect('YEAR(deal.closeDate)', 'closeDateYear')
            .addSelect('SUM(deal.value)', 'value')
            .where('deal.stageId = :stageId', { stageId: stage.id })
            .andWhere('deal.closeDate IS NOT NULL')
            .groupBy('closeDateMonth')
            .addGroupBy('closeDateYear')
            .orderBy('closeDateYear', 'ASC')
            .addOrderBy('closeDateMonth', 'ASC')
            .getRawMany<{
                closeDateMonth: number;
                closeDateYear: number;
                value: string | number | null;
            }>();

        return rows.map((row) => ({
            groupBy: {
                closeDateMonth: row.closeDateMonth,
                closeDateYear: row.closeDateYear,
            },
            sum: {
                value: row.value == null ? null : Number(row.value),
            },
        }));
    }
}
