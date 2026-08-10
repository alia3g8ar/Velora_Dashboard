import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { User } from '../crm/entities/user.entity';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            global: true,
            useFactory: (config: ConfigService) => ({
                secret:
                    config.get<string>('JWT_SECRET') ??
                    'velora-local-dev-secret',
                signOptions: { expiresIn: '30d' },
            }),
        }),
    ],
    providers: [
        AuthService,
        AuthResolver,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AuthModule {}
