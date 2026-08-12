import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Response } from 'express';
import { clearAuthCookie, setAuthCookie } from '../../common/auth/cookies';
import { IsPublic } from '../../common/decorators/public.decorator';
import { AuthenticatedRequest } from '../../common/guard/jwt-auth.guard';
import { Role } from '../crm/enums';
import { User } from '../crm/entities/user.entity';
import { AuthResponse } from './auth-response';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';

type AuthContext = {
    req: AuthenticatedRequest;
    res: Response;
};

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) {}

    @IsPublic()
    @Mutation(() => AuthResponse)
    async login(
        @Args('loginInput') loginInput: LoginInput,
        @Context() context: AuthContext,
    ): Promise<AuthResponse> {
        const result = await this.authService.login(loginInput);
        // Hand the browser the token as an HttpOnly cookie so it never lives
        // in JavaScript-accessible storage.
        setAuthCookie(context.res, result.accessToken);
        return result;
    }

    @IsPublic()
    @Mutation(() => AuthResponse)
    async register(
        @Args('registerInput') registerInput: RegisterInput,
        @Context() context: AuthContext,
    ): Promise<AuthResponse> {
        const result = await this.authService.register(registerInput);
        setAuthCookie(context.res, result.accessToken);
        return result;
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
        @Context() context: AuthContext,
    ): Promise<AuthResponse> {
        const result = await this.authService.login(loginInput);

        if (result.user.role !== Role.ADMIN) {
            throw new ForbiddenException(
                'Admin role is required for this operation',
            );
        }

        setAuthCookie(context.res, result.accessToken);
        return result;
    }

    /**
     * Clears the session cookie. Marked public so logging out always works,
     * even when the access token has already expired.
     */
    @IsPublic()
    @Mutation(() => Boolean)
    logout(@Context() context: AuthContext): boolean {
        clearAuthCookie(context.res);
        return true;
    }

    @Query(() => User)
    me(@Context() context: AuthContext): Promise<User> {
        const sub = context.req.user?.sub;

        if (!sub) {
            throw new UnauthorizedException('Not authenticated');
        }

        return this.authService.getMe(Number(sub));
    }
}
