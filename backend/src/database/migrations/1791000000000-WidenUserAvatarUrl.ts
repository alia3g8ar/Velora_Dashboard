import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Widen `users.avatar_url` so self-hosted avatars can be stored as data URLs.
 * Previously the column was varchar(500), sized for remote URLs like
 * `https://i.pravatar.cc/...`. A client-resized JPEG avatar encoded as a
 * base64 data URL is several tens of kilobytes, so the column needs to be
 * MEDIUMTEXT (16 MB max).
 */
export class WidenUserAvatarUrl1791000000000 implements MigrationInterface {
    name = 'WidenUserAvatarUrl1791000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\`
                MODIFY \`avatar_url\` MEDIUMTEXT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\`
                MODIFY \`avatar_url\` varchar(500) NULL
        `);
    }
}
