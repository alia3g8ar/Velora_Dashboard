import {
    Float,
    GraphQLISODateTime,
    ID,
    Int,
    ObjectType,
} from '@nestjs/graphql';
import {
    FilterableField,
    FilterableRelation,
    IDField,
    QueryOptions,
} from '@ptc-org/nestjs-query-graphql';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Contact } from './contact.entity';
import { DealStage } from './deal-stage.entity';
import { User } from './user.entity';

@ObjectType('Deal')
@Entity({ name: 'deals' })
@QueryOptions({ enableTotalCount: true })
@FilterableRelation('company', () => Company, { nullable: false })
@FilterableRelation('dealOwner', () => User, { nullable: false })
@FilterableRelation('dealContact', () => Contact, { nullable: true })
@FilterableRelation('stage', () => DealStage, { nullable: true })
export class Deal {
    @IDField(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => String)
    @Column({ type: 'varchar', length: 255 })
    title: string;

    @FilterableField(() => Float, { nullable: true })
    @Column({ type: 'float', nullable: true })
    value?: number | null;

    @FilterableField(() => String, { nullable: true })
    @Column({ type: 'text', nullable: true })
    notes?: string | null;

    /** Derived from closeDate by DealSubscriber; aggregate-only. */
    @FilterableField(() => Int, { filterOnly: true })
    @Column({ name: 'close_date_day', type: 'int', nullable: true })
    closeDateDay?: number | null;

    /** Derived from closeDate by DealSubscriber; aggregate-only. */
    @FilterableField(() => Int, { filterOnly: true })
    @Column({ name: 'close_date_month', type: 'int', nullable: true })
    closeDateMonth?: number | null;

    /** Derived from closeDate by DealSubscriber; aggregate-only. */
    @FilterableField(() => Int, { filterOnly: true })
    @Column({ name: 'close_date_year', type: 'int', nullable: true })
    closeDateYear?: number | null;

    /** Not exposed through GraphQL; powers the month/year aggregate fields. */
    @Column({ name: 'close_date', type: 'datetime', nullable: true })
    closeDate?: Date | null;

    @FilterableField(() => ID)
    @Column({ name: 'company_id', type: 'int' })
    companyId: number;

    @ManyToOne(() => Company, (company) => company.deals, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @FilterableField(() => ID)
    @Column({ name: 'deal_owner_id', type: 'int' })
    dealOwnerId: number;

    @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'deal_owner_id' })
    dealOwner: User;

    @FilterableField(() => ID, { nullable: true })
    @Column({ name: 'deal_contact_id', type: 'int', nullable: true })
    dealContactId?: number | null;

    @ManyToOne(() => Contact, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'deal_contact_id' })
    dealContact?: Contact | null;

    @FilterableField(() => ID, { nullable: true })
    @Column({ name: 'stage_id', type: 'int', nullable: true })
    stageId?: number | null;

    @ManyToOne(() => DealStage, (stage) => stage.deals, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'stage_id' })
    stage?: DealStage | null;

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;
}
