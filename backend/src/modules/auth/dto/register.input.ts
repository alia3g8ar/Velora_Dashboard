import { Field, InputType } from '@nestjs/graphql';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

@InputType('RegisterInput')
export class RegisterInput {
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    name: string;

    @Field(() => String)
    @IsEmail()
    email: string;

    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @MinLength(6, {
        message: 'Password must be at least 6 characters',
    })
    password: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    jobTitle?: string | null;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    phone?: string | null;
}
