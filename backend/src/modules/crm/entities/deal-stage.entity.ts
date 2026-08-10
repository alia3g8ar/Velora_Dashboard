import { GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import {
    FilterableField,
    IDField,
    QueryOptions,
    UnPagedRelation,
} from '@ptc-org/nestjs-query-graphql';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Deal } from './deal.entity';

@ObjectType('DealStage')
@Entity({ name: 'deal_stages' })
@QueryOptions({ enableTotalCount: true })
@UnPagedRelation('deals', () => Deal)
export class DealStage {
    @IDField(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => String)
    @Column({ type: 'varchar', length: 64 })
    title: string;

    @OneToMany(() => Deal, (deal) => deal.stage)
    deals: Deal[];

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;
}
