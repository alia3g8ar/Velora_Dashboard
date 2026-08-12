import { GraphQLISODateTime, ID, Int, ObjectType } from '@nestjs/graphql';
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
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Contact } from './contact.entity';
import { Deal } from './deal.entity';
import { User } from './user.entity';
import { BusinessType, CompanySize, Industry } from '../enums';

@ObjectType('Company')
@Entity({ name: 'companies' })
@QueryOptions({ enableTotalCount: true })
// Per-user data isolation is enforced by the scoped query service wired in
// `crm.module.ts` (see `services/scoped-query.service.ts`).
@FilterableRelation('salesOwner', () => User, { nullable: false })
export class Company {
    @IDField(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => String)
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @FilterableField(() => String, { nullable: true })
    @Column({
        name: 'avatar_url',
        type: 'varchar',
        length: 500,
        nullable: true,
    })
    avatarUrl?: string | null;

    @FilterableField(() => Int, { nullable: true })
    @Column({ name: 'total_revenue', type: 'int', nullable: true })
    totalRevenue?: number | null;

    @FilterableField(() => Industry, { nullable: true })
    @Column({ type: 'varchar', length: 64, nullable: true })
    industry?: Industry | null;

    @FilterableField(() => CompanySize, { nullable: true })
    @Column({
        name: 'company_size',
        type: 'varchar',
        length: 32,
        nullable: true,
    })
    companySize?: CompanySize | null;

    @FilterableField(() => BusinessType, { nullable: true })
    @Column({
        name: 'business_type',
        type: 'varchar',
        length: 16,
        nullable: true,
    })
    businessType?: BusinessType | null;

    @FilterableField(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 128, nullable: true })
    country?: string | null;

    @FilterableField(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 255, nullable: true })
    website?: string | null;

    @FilterableField(() => ID)
    @Column({ name: 'sales_owner_id', type: 'int' })
    salesOwnerId: number;

    @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'sales_owner_id' })
    salesOwner: User;

    @OneToMany(() => Contact, (contact) => contact.company)
    contacts: Contact[];

    @OneToMany(() => Deal, (deal) => deal.company)
    deals: Deal[];

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;
}
