import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../crm/entities/user.entity';
import { AdminResolver } from './admin.resolver';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [AdminResolver],
})
export class AdminModule {}
