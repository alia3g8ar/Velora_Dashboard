import {
    Args,
    Context,
    Field,
    GraphQLISODateTime,
    ID,
    InputType,
    Mutation,
    Resolver,
} from '@nestjs/graphql';
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { InjectRepository } from '@nestjs/typeorm';
import {
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { In, Repository } from 'typeorm';
import { Type } from 'class-transformer';
import { AuthenticatedRequest } from '../../../common/guard/jwt-auth.guard';
import { getCurrentUserId } from '../../../common/context/current-user';
import { ChecklistItemInput } from '../entities/check-list-item';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';

@InputType('TaskCreateInput')
export class TaskCreateInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    title: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    description?: string | null;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @IsOptional()
    dueDate?: Date | null;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    stageId?: string | null;

    @Field(() => [ChecklistItemInput], { nullable: true })
    @IsOptional()
    checklist?: ChecklistItemInput[] | null;

    @Field(() => [ID], { nullable: true })
    @IsOptional()
    userIds?: string[] | null;
}

@InputType('TaskUpdateInput')
export class TaskUpdateInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    title?: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    description?: string | null;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @IsOptional()
    dueDate?: Date | null;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    stageId?: string | null;

    @Field(() => Boolean, { nullable: true })
    @IsOptional()
    @IsBoolean()
    completed?: boolean;

    @Field(() => [ChecklistItemInput], { nullable: true })
    @IsOptional()
    checklist?: ChecklistItemInput[] | null;

    @Field(() => [ID], { nullable: true })
    @IsOptional()
    userIds?: string[] | null;
}

@InputType('CreateOneTaskInput')
export class CreateOneTaskInput {
    @Field(() => TaskCreateInput)
    @Type(() => TaskCreateInput)
    @ValidateNested()
    task: TaskCreateInput;
}

@InputType('UpdateOneTaskInput')
export class UpdateOneTaskInput {
    @Field(() => ID)
    id: string;

    @Field(() => TaskUpdateInput)
    @Type(() => TaskUpdateInput)
    @ValidateNested()
    update: TaskUpdateInput;
}

@Resolver(() => Task)
export class TaskResolver extends CRUDResolver(Task, {
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.OFFSET,
    // Allow the frontend's un-paged `mode: "off"` list fetches.
    read: { maxResultsSize: -1 },
    create: { one: { disabled: true }, many: { disabled: true } },
    update: { one: { disabled: true }, many: { disabled: true } },
    delete: { many: { disabled: true } },
    // Raw aggregate endpoints would leak cross-user stats.
    aggregate: { enabled: false },
}) {
    constructor(
        @InjectQueryService(Task) readonly service: QueryService<Task>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        super(service);
    }

    @Mutation(() => Task)
    async createOneTask(
        @Args('input') input: CreateOneTaskInput,
        @Context() context: { req: AuthenticatedRequest },
    ): Promise<Task> {
        const userId = getCurrentUserId(context);
        // `userIds` is intentionally ignored: tasks are assigned to their
        // creator only (strict per-user isolation).
        const { title, description, dueDate, stageId, checklist } = input.task;

        const task = this.taskRepository.create({
            title,
            description: description ?? null,
            dueDate: dueDate ?? null,
            stageId: stageId == null ? null : Number(stageId),
            completed: false,
            checklist: checklist ?? null,
            createdByUserId: userId,
        });

        const saved = await this.taskRepository.save(task);

        // Strict per-user isolation: a task is only ever assigned to its
        // creator, never to other users (which would expose their identity
        // through the `users` relation).
        const users = await this.userRepository.findBy({
            id: In([userId]),
        });
        saved.users = users;
        return this.taskRepository.save(saved);
    }

    @Mutation(() => Task)
    async updateOneTask(
        @Args('input') input: UpdateOneTaskInput,
        @Context() context: { req: AuthenticatedRequest },
    ): Promise<Task> {
        const userId = getCurrentUserId(context);
        const { id, update } = input;
        const task = await this.taskRepository.findOneByOrFail({
            id: Number(id),
            createdByUserId: userId,
        });

        const { stageId, userIds, ...scalars } = update;

        // class-transformer populates every declared field on the input class,
        // leaving untouched ones as own properties with `undefined`. merge()
        // (unlike Object.assign) skips those, so real entity values survive.
        this.taskRepository.merge(task, scalars);

        if (stageId !== undefined) {
            task.stageId = stageId === null ? null : Number(stageId);
        }

        // Ignore submitted assignees: a task stays assigned to its creator
        // only, so no other user's identity is ever exposed.
        void userIds;
        const users = await this.userRepository.findBy({ id: In([userId]) });
        task.users = users;

        return this.taskRepository.save(task);
    }
}
