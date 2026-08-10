import {
    Field,
    Float,
    GraphQLISODateTime,
    ID,
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
import { User } from './user.entity';

@ObjectType('AuditChange')
export class AuditChange {
    @Field(() => String)
    field: string;

    @Field(() => String, { nullable: true })
    from?: string | null;

    @Field(() => String, { nullable: true })
    to?: string | null;
}

@ObjectType('Audit')
@Entity({ name: 'audits' })
@QueryOptions({ enableTotalCount: true })
@FilterableRelation('user', () => User, { nullable: true })
export class Audit {
    @IDField(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => String)
    @Column({ type: 'varchar', length: 32 })
    action: string;

    @FilterableField(() => String)
    @Column({ name: 'target_entity', type: 'varchar', length: 64 })
    targetEntity: string;

    @FilterableField(() => Float)
    @Column({ name: 'target_id', type: 'int' })
    targetId: number;

    @Field(() => [AuditChange], { nullable: true })
    @Column({ type: 'json', nullable: true })
    changes?: AuditChange[] | null;

    @FilterableField(() => ID, { nullable: true })
    @Column({ name: 'user_id', type: 'int', nullable: true })
    userId?: number | null;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user?: User | null;

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;
}
