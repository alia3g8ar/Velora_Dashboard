import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    DealAggregateResponse,
    DealSumAggregate,
} from '../aggregates/deal-aggregate.types';
import { AuthenticatedRequest } from '../../../common/guard/jwt-auth.guard';
import { getCurrentUserId } from '../../../common/context/current-user';
import { Company } from '../entities/company.entity';
import { Deal } from '../entities/deal.entity';
import { CompanyCreateInput, CompanyUpdateInput } from '../inputs';

@Resolver(() => Company)
export class CompanyResolver extends CRUDResolver(Company, {
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.OFFSET,
    // The frontend fetches un-paged lists with `mode: "off"` (limit
    // 2147483647), matching the original Refine CRM API contract.
    read: { maxResultsSize: -1 },
    CreateDTOClass: CompanyCreateInput,
    UpdateDTOClass: CompanyUpdateInput,
    create: { many: { disabled: true } },
    update: { many: { disabled: true } },
    delete: { many: { disabled: true } },
    // Raw aggregate endpoints would leak cross-user stats; the dashboard uses
    // scoped `totalCount` + explicit ResolveFields instead.
    aggregate: { enabled: false },
}) {
    constructor(
        @InjectQueryService(Company) readonly service: QueryService<Company>,
        @InjectRepository(Deal)
        private readonly dealRepository: Repository<Deal>,
    ) {
        super(service);
    }

    /**
     * Sum of the OPEN deal values for a company. Powers the "Open deals
     * amount" column of the companies list, backed by real Deal records.
     * Deals whose stage is WON or LOST are excluded; deals without a stage
     * still count as open pipeline.
     */
    @ResolveField(() => [DealAggregateResponse])
    async dealsAggregate(
        @Parent() company: Company,
        @Context() context: { req: AuthenticatedRequest },
    ): Promise<DealAggregateResponse[]> {
        const row = await this.dealRepository
            .createQueryBuilder('deal')
            .select('SUM(deal.value)', 'value')
            .leftJoin('deal.stage', 'stage')
            .where('deal.companyId = :companyId', { companyId: company.id })
            .andWhere('deal.dealOwnerId = :userId', {
                userId: getCurrentUserId(context),
            })
            .andWhere(
                '(stage.id IS NULL OR stage.title NOT IN (:...closedTitles))',
                {
                    closedTitles: ['WON', 'LOST'],
                },
            )
            .getRawOne<{ value: string | number | null }>();

        const sum: DealSumAggregate = {
            value: row?.value == null ? null : Number(row.value),
        };

        return [{ sum }];
    }
}
