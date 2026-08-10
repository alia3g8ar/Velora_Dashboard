import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../crm/entities/user.entity';
import { LoginInput } from './dto/login.input';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    async login(loginInput: LoginInput) {
        const email = loginInput.email.trim().toLowerCase();

        const user = await this.userRepository.findOneBy({ email });

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const passwordMatches = await compare(
            loginInput.password,
            user.password,
        );

        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid email or password');
        }

        return {
            accessToken: this.signAccessToken(user),
            user,
        };
    }

    async getMe(userId: number): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: userId });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }

    private signAccessToken(user: User): string {
        return this.jwtService.sign({
            sub: user.id,
            role: user.role,
        });
    }
}
