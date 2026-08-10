import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../crm/entities/user.entity';

@ObjectType('AuthResponse')
export class AuthResponse {
    @Field()
    accessToken: string;

    @Field(() => User)
    user: User;
}
