import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Binary avatar storage. Uploaded images are stored as BLOB rows (never
 * base64 text in API payloads or the entity columns) and served back through
 * `GET /uploads/avatar/:id` with proper cache headers.
 */
@Entity({ name: 'avatar_images' })
export class AvatarImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'longblob' })
    data: Buffer;

    @Column({ name: 'mime_type', type: 'varchar', length: 50 })
    mimeType: string;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;
}
