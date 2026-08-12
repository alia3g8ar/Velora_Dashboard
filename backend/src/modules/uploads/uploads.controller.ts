import {
    BadRequestException,
    Controller,
    Get,
    Headers,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { Repository } from 'typeorm';
import { IsPublic } from '../../common/decorators/public.decorator';
import { AvatarImage } from './entities/avatar-image.entity';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

@Controller('uploads')
export class UploadsController {
    constructor(
        @InjectRepository(AvatarImage)
        private readonly avatarRepository: Repository<AvatarImage>,
    ) {}

    /**
     * Accepts an avatar file as a multipart upload, stores the raw bytes in a
     * BLOB row and returns a stable `/uploads/avatar/:id` URL the entity
     * `avatarUrl` fields then reference. The path is relative on purpose so
     * the stored value stays origin-agnostic. The route is protected by the
     * global JWT guard (cookie token).
     */
    @Post('avatar')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: { fileSize: MAX_AVATAR_BYTES },
        }),
    )
    async uploadAvatar(
        @UploadedFile() file?: Express.Multer.File,
    ): Promise<{ url: string }> {
        if (!file) {
            throw new BadRequestException('Missing image file');
        }

        if (!file.mimetype.startsWith('image/')) {
            throw new BadRequestException('Only image files are allowed');
        }

        const saved = await this.avatarRepository.save(
            this.avatarRepository.create({
                data: file.buffer,
                mimeType: file.mimetype,
            }),
        );

        return { url: `/uploads/avatar/${saved.id}` };
    }

    /**
     * Streams a stored avatar with caching headers. Public: the browser's
     * `img` tags fetch these directly, so no auth state is needed to view a
     * photo once its URL path is known.
     */
    @Get('avatar/:id')
    @IsPublic()
    async getAvatar(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: Response,
        @Headers('if-none-match') ifNoneMatch?: string,
    ): Promise<void> {
        const avatar = await this.avatarRepository.findOneBy({ id });

        if (!avatar) {
            throw new NotFoundException('Image not found');
        }

        const etag = `"${createHash('md5').update(avatar.data).digest('hex')}"`;

        if (ifNoneMatch?.includes(etag)) {
            res.setHeader('ETag', etag);
            res.status(304).end();
            return;
        }

        res.setHeader('Content-Type', avatar.mimeType);
        res.setHeader('Content-Length', avatar.data.length);
        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.send(avatar.data);
    }
}
