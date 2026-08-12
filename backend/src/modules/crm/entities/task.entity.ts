import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
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
import { CheckListItem } from './check-list-item';
import { TaskStage } from './task-stage.entity';
import { User } from './user.entity';

@ObjectType('Task')
@Entity({ name: 'tasks' })
@QueryOptions({ enableTotalCount: true })
// Per-user data isolation is enforced by the scoped query service (see
// `services/scoped-query.service.ts`).
@FilterableRelation('stage', () => TaskStage, { nullable: true })
@FilterableRelation('createdBy', () => User, { nullable: true })
@UnPagedRelation('users', () => User)
export class Task {
    @IDField(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => String)
    @Column({ type: 'varchar', length: 255 })
    title: string;

    @FilterableField(() => String, { nullable: true })
    @Column({ type: 'text', nullable: true })
    description?: string | null;

    @FilterableField(() => GraphQLISODateTime, { nullable: true })
    @Column({ name: 'due_date', type: 'datetime', nullable: true })
    dueDate?: Date | null;

    @FilterableField(() => Boolean)
    @Column({ type: 'boolean', default: false })
    completed: boolean;

    @FilterableField(() => ID, { nullable: true })
    @Column({ name: 'stage_id', type: 'int', nullable: true })
    stageId?: number | null;

    @ManyToOne(() => TaskStage, (stage) => stage.tasks, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'stage_id' })
    stage?: TaskStage | null;

    @FilterableField(() => ID, { nullable: true })
    @Column({ name: 'created_by_id', type: 'int', nullable: true })
    createdByUserId?: number | null;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'created_by_id' })
    createdBy?: User | null;

    @Field(() => [CheckListItem], { nullable: true })
    @Column({ type: 'json', nullable: true })
    checklist?: CheckListItem[] | null;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'task_users',
        joinColumn: { name: 'task_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    users: User[];

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;
}
