import { UnauthorizedException } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IsPublic } from '../../common/decorators/public.decorator';
import { AuthenticatedRequest } from '../../common/guard/jwt-auth.guard';
import { User } from '../crm/entities/user.entity';
import { AuthResponse } from './auth-response';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) {}

    @IsPublic()
    @Mutation(() => AuthResponse)
    login(@Args('loginInput') loginInput: LoginInput) {
        return this.authService.login(loginInput);
    }

    @IsPublic()
    @Mutation(() => AuthResponse)
    register(@Args('registerInput') registerInput: RegisterInput) {
        return this.authService.register(registerInput);
    }

    @Query(() => User)
    me(@Context() context: { req: AuthenticatedRequest }): Promise<User> {
        const sub = context.req.user?.sub;

        if (!sub) {
            throw new UnauthorizedException('Not authenticated');
        }

        return this.authService.getMe(Number(sub));
    }
}
