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
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ContactStage, ContactStatus } from '../enums';
import { Company } from './company.entity';
import { User } from './user.entity';

@ObjectType('Contact')
@Entity({ name: 'contacts' })
@QueryOptions({ enableTotalCount: true })
// Per-user data isolation is enforced by the scoped query service (see
// `services/scoped-query.service.ts`).
@FilterableRelation('company', () => Company, { nullable: false })
@FilterableRelation('salesOwner', () => User, { nullable: false })
export class Contact {
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

    @FilterableField(() => String)
    @Column({ type: 'varchar', length: 255 })
    email: string;

    @FilterableField(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 32, nullable: true })
    phone?: string | null;

    @FilterableField(() => String, { nullable: true })
    @Column({ name: 'job_title', type: 'varchar', length: 255, nullable: true })
    jobTitle?: string | null;

    @FilterableField(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 64, nullable: true })
    timezone?: string | null;

    @FilterableField(() => ContactStatus, { defaultValue: ContactStatus.NEW })
    @Column({ type: 'varchar', length: 32, default: ContactStatus.NEW })
    status: ContactStatus;

    @FilterableField(() => ContactStage, { defaultValue: ContactStage.LEAD })
    @Column({ type: 'varchar', length: 32, default: ContactStage.LEAD })
    stage: ContactStage;

    @FilterableField(() => Int, { nullable: true })
    @Column({ type: 'int', nullable: true })
    score?: number | null;

    @FilterableField(() => ID)
    @Column({ name: 'company_id', type: 'int' })
    companyId: number;

    @ManyToOne(() => Company, (company) => company.contacts, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @FilterableField(() => ID)
    @Column({ name: 'sales_owner_id', type: 'int' })
    salesOwnerId: number;

    @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'sales_owner_id' })
    salesOwner: User;

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;
}
