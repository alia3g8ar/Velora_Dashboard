import {
    Field,
    Float,
    GraphQLISODateTime,
    ID,
    InputType,
    Int,
} from '@nestjs/graphql';
import {
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import {
    BusinessType,
    CompanySize,
    ContactStage,
    ContactStatus,
    Industry,
    Role,
} from './enums';

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
    // A client-resized JPEG avatar encoded as base64 is a few KB, so anything
    // larger is rejected with a clear message before it reaches the database.
    @MaxLength(1_000_000, {
        message: 'Avatar image is too large. Please use a smaller photo.',
    })
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
    // A client-resized JPEG avatar encoded as base64 is a few KB, so anything
    // larger is rejected with a clear message before it reaches the database.
    @MaxLength(1_000_000, {
        message: 'Avatar image is too large. Please use a smaller photo.',
    })
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
    // ~750 KB of binary encoded as base64; a 256px JPEG avatar is a few KB,
    // so anything larger is rejected with a clear message before it reaches
    // the database (which would otherwise surface a raw SQL error).
    @MaxLength(1_000_000, {
        message: 'Avatar image is too large. Please use a smaller photo.',
    })
    avatarUrl?: string | null;

    @Field(() => Role, { nullable: true })
    @IsOptional()
    role?: Role;
}

@InputType('ContactCreateInput')
export class ContactCreateInput {
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    name: string;

    @Field(() => String)
    @IsEmail()
    email: string;

    @Field(() => ID)
    @IsString()
    @IsNotEmpty()
    companyId: number;

    @Field(() => ID)
    @IsString()
    @IsNotEmpty()
    salesOwnerId: number;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(1_000_000, {
        message: 'Avatar image is too large. Please use a smaller photo.',
    })
    avatarUrl?: string | null;

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

    @Field(() => ContactStatus, { nullable: true })
    @IsOptional()
    @IsEnum(ContactStatus)
    status?: ContactStatus;

    @Field(() => ContactStage, { nullable: true })
    @IsOptional()
    @IsEnum(ContactStage)
    stage?: ContactStage;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    score?: number | null;
}

@InputType('ContactUpdateInput')
export class ContactUpdateInput {
    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    name?: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsEmail()
    email?: string;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsString()
    companyId?: number;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsString()
    salesOwnerId?: number;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(1_000_000, {
        message: 'Avatar image is too large. Please use a smaller photo.',
    })
    avatarUrl?: string | null;

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

    @Field(() => ContactStatus, { nullable: true })
    @IsOptional()
    @IsEnum(ContactStatus)
    status?: ContactStatus;

    @Field(() => ContactStage, { nullable: true })
    @IsOptional()
    @IsEnum(ContactStage)
    stage?: ContactStage;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    score?: number | null;
}

@InputType('DealCreateInput')
export class DealCreateInput {
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    title: string;

    @Field(() => ID)
    @IsString()
    @IsNotEmpty()
    companyId: number;

    @Field(() => ID)
    @IsString()
    @IsNotEmpty()
    dealOwnerId: number;

    @Field(() => Float, { nullable: true })
    @IsOptional()
    @IsNumber()
    value?: number | null;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    notes?: string | null;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @IsOptional()
    closeDate?: Date | null;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsString()
    dealContactId?: number | null;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsString()
    stageId?: number | null;
}

@InputType('DealUpdateInput')
export class DealUpdateInput {
    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    title?: string;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsString()
    companyId?: number;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsString()
    dealOwnerId?: number;

    @Field(() => Float, { nullable: true })
    @IsOptional()
    @IsNumber()
    value?: number | null;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    notes?: string | null;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @IsOptional()
    closeDate?: Date | null;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsString()
    dealContactId?: number | null;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsString()
    stageId?: number | null;
}
