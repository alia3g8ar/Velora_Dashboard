import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    DealAggregateResponse,
    DealSumAggregate,
} from '../aggregates/deal-aggregate.types';
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
}) {
    constructor(
        @InjectQueryService(Company) readonly service: QueryService<Company>,
        @InjectRepository(Deal)
        private readonly dealRepository: Repository<Deal>,
    ) {
        super(service);
    }

    /**
     * Sum of the deal values for a company. Powers the "Open deals amount"
     * column of the companies list, backed by real Deal records.
     */
    @ResolveField(() => [DealAggregateResponse])
    async dealsAggregate(
        @Parent() company: Company,
    ): Promise<DealAggregateResponse[]> {
        const row = await this.dealRepository
            .createQueryBuilder('deal')
            .select('SUM(deal.value)', 'value')
            .where('deal.companyId = :companyId', { companyId: company.id })
            .getRawOne<{ value: string | number | null }>();

        const sum: DealSumAggregate = {
            value: row?.value == null ? null : Number(row.value),
        };

        return [{ sum }];
    }
}
