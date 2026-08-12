import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Widen `companies.avatar_url` and `contacts.avatar_url` so self-hosted
 * logos/avatars can be stored as data URLs, matching what was already done
 * for `users.avatar_url`. The columns were varchar(500), sized for remote
 * URLs like `https://i.pravatar.cc/...`; a client-resized JPEG encoded as a
 * base64 data URL is several tens of kilobytes, so MEDIUMTEXT (16 MB max)
 * is required.
 */
export class WidenCompanyContactAvatarUrl1792000000000 implements MigrationInterface {
    name = 'WidenCompanyContactAvatarUrl1792000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`companies\`
                MODIFY \`avatar_url\` MEDIUMTEXT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`contacts\`
                MODIFY \`avatar_url\` MEDIUMTEXT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`companies\`
                MODIFY \`avatar_url\` varchar(500) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`contacts\`
                MODIFY \`avatar_url\` varchar(500) NULL
        `);
    }
}
