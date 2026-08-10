import { GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { FilterableField, IDField } from '@ptc-org/nestjs-query-graphql';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Role } from '../enums';

@ObjectType('User')
@Entity({ name: 'users' })
export class User {
    @IDField(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 255, nullable: true })
    name?: string | null;

    @FilterableField(() => String)
    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @FilterableField(() => Role)
    @Column({ type: 'varchar', length: 32, default: Role.SALES_INTERN })
    role: Role;

    @FilterableField(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 20, nullable: true })
    phone?: string | null;

    @FilterableField(() => String, { nullable: true })
    @Column({ name: 'job_title', type: 'varchar', length: 255, nullable: true })
    jobTitle?: string | null;

    @FilterableField(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 64, nullable: true })
    timezone?: string | null;

    @FilterableField(() => String, { nullable: true })
    @Column({
        name: 'avatar_url',
        type: 'varchar',
        length: 500,
        nullable: true,
    })
    avatarUrl?: string | null;

    /** Never exposed through GraphQL. */
    @Column({ type: 'varchar', length: 255, nullable: true })
    password?: string | null;

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;
}
