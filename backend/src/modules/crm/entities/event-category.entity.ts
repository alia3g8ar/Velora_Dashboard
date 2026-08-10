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
import { Event } from './event.entity';

@ObjectType('EventCategory')
@Entity({ name: 'event_categories' })
@QueryOptions({ enableTotalCount: true })
@UnPagedRelation('events', () => Event)
export class EventCategory {
    @IDField(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => String)
    @Column({ type: 'varchar', length: 128 })
    title: string;

    @OneToMany(() => Event, (event) => event.category)
    events: Event[];

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;
}
