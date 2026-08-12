import { GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import {
    FilterableField,
    FilterableRelation,
    IDField,
    QueryOptions,
    UnPagedRelation,
} from '@ptc-org/nestjs-query-graphql';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { EventCategory } from './event-category.entity';
import { User } from './user.entity';

@ObjectType('Event')
@Entity({ name: 'events' })
@QueryOptions({ enableTotalCount: true })
// Per-user data isolation is enforced by the scoped query service (see
// `services/scoped-query.service.ts`).
@FilterableRelation('category', () => EventCategory, { nullable: false })
@FilterableRelation('createdBy', () => User, { nullable: true })
@UnPagedRelation('participants', () => User)
export class Event {
    @IDField(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => String)
    @Column({ type: 'varchar', length: 255 })
    title: string;

    @FilterableField(() => String, { nullable: true })
    @Column({ type: 'text', nullable: true })
    description?: string | null;

    @FilterableField(() => String)
    @Column({ type: 'varchar', length: 16, default: '#1677FF' })
    color: string;

    @FilterableField(() => GraphQLISODateTime)
    @Column({ name: 'start_date', type: 'datetime' })
    startDate: Date;

    @FilterableField(() => GraphQLISODateTime)
    @Column({ name: 'end_date', type: 'datetime' })
    endDate: Date;

    @FilterableField(() => ID)
    @Column({ name: 'category_id', type: 'int' })
    categoryId: number;

    @ManyToOne(() => EventCategory, (category) => category.events, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'category_id' })
    category: EventCategory;

    @FilterableField(() => ID, { nullable: true })
    @Column({ name: 'created_by_id', type: 'int', nullable: true })
    createdByUserId?: number | null;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'created_by_id' })
    createdBy?: User | null;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'event_participants',
        joinColumn: { name: 'event_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    participants: User[];

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;
}
