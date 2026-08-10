import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('DealAggregateGroupBy')
export class DealAggregateGroupBy {
    @Field(() => Int, { nullable: true })
    closeDateDay?: number | null;

    @Field(() => Int, { nullable: true })
    closeDateMonth?: number | null;

    @Field(() => Int, { nullable: true })
    closeDateYear?: number | null;
}

@ObjectType('DealSumAggregate')
export class DealSumAggregate {
    @Field(() => Float, { nullable: true })
    value?: number | null;
}

@ObjectType('DealAggregateResponse')
export class DealAggregateResponse {
    @Field(() => DealAggregateGroupBy, { nullable: true })
    groupBy?: DealAggregateGroupBy | null;

    @Field(() => DealSumAggregate, { nullable: true })
    sum?: DealSumAggregate | null;
}
