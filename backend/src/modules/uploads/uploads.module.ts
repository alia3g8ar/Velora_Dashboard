import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvatarImage } from './entities/avatar-image.entity';
import { UploadsController } from './uploads.controller';

@Module({
    imports: [TypeOrmModule.forFeature([AvatarImage])],
    controllers: [UploadsController],
})
export class UploadsModule {}
