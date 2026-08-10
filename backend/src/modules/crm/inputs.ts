import { Field, ID, InputType, Int } from '@nestjs/graphql';
import {
    IsEmail,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';
import { BusinessType, CompanySize, Industry, Role } from './enums';

/**
 * GraphQL input types for the entities the frontend actually mutates.
 *
 * id / createdAt / updatedAt are deliberately absent: the server manages
 * those fields itself. These classes are passed to the CRUD resolvers as
 * `CreateDTOClass` / `UpdateDTOClass`, replacing nestjs-query's generated
 * inputs (which would otherwise require clients to send the timestamps).
 */
@InputType('CompanyCreateInput')
export class CompanyCreateInput {
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    name: string;

    @Field(() => ID)
    @IsString()
    @IsNotEmpty()
    salesOwnerId: number;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    avatarUrl?: string | null;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    totalRevenue?: number | null;

    @Field(() => Industry, { nullable: true })
    @IsOptional()
    industry?: Industry | null;

    @Field(() => CompanySize, { nullable: true })
    @IsOptional()
    companySize?: CompanySize | null;

    @Field(() => BusinessType, { nullable: true })
    @IsOptional()
    businessType?: BusinessType | null;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    country?: string | null;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    website?: string | null;
}

@InputType('CompanyUpdateInput')
export class CompanyUpdateInput {
    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    name?: string;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsString()
    salesOwnerId?: number;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    avatarUrl?: string | null;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    totalRevenue?: number | null;

    @Field(() => Industry, { nullable: true })
    @IsOptional()
    industry?: Industry | null;

    @Field(() => CompanySize, { nullable: true })
    @IsOptional()
    companySize?: CompanySize | null;

    @Field(() => BusinessType, { nullable: true })
    @IsOptional()
    businessType?: BusinessType | null;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    country?: string | null;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    website?: string | null;
}

@InputType('UserUpdateInput')
export class UserUpdateInput {
    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    name?: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsEmail()
    email?: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    phone?: string | null;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    jobTitle?: string | null;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    timezone?: string | null;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    avatarUrl?: string | null;

    @Field(() => Role, { nullable: true })
    @IsOptional()
    role?: Role;
}
