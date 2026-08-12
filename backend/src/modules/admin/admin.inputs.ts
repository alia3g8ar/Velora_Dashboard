import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../crm/enums';

@InputType('AdminUpdateUserRoleInput')
export class AdminUpdateUserRoleInput {
    @Field(() => ID)
    @IsString()
    @IsNotEmpty()
    id: string;

    @Field(() => Role)
    @IsEnum(Role)
    role: Role;
}

@InputType('AdminDeleteUserInput')
export class AdminDeleteUserInput {
    @Field(() => ID)
    @IsString()
    @IsNotEmpty()
    id: string;
}
