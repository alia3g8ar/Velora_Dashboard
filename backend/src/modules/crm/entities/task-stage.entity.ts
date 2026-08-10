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
import { Task } from './task.entity';

@ObjectType('TaskStage')
@Entity({ name: 'task_stages' })
@QueryOptions({ enableTotalCount: true })
@UnPagedRelation('tasks', () => Task)
export class TaskStage {
    @IDField(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => String)
    @Column({ type: 'varchar', length: 64 })
    title: string;

    @OneToMany(() => Task, (task) => task.stage)
    tasks: Task[];

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;
}
