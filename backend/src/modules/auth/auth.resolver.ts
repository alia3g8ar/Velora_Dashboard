import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IsPublic } from '../../common/decorators/public.decorator';
import { AuthenticatedRequest } from '../../common/guard/jwt-auth.guard';
import { Role } from '../crm/enums';
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

    /**
     * Dedicated entry point for the standalone admin panel. The regular
     * `login` mutation stays open to every account; this one only issues a
     * token when the credentials belong to an ADMIN user, so non-admin
     * accounts can never authenticate into the admin panel even with valid
     * credentials.
     */
    @IsPublic()
    @Mutation(() => AuthResponse)
    async adminLogin(
        @Args('loginInput') loginInput: LoginInput,
    ): Promise<AuthResponse> {
        const result = await this.authService.login(loginInput);

        if (result.user.role !== Role.ADMIN) {
            throw new ForbiddenException(
                'Admin role is required for this operation',
            );
        }

        return result;
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
