import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `avatar_images` table that stores uploaded avatar files as
 * BLOB rows, so avatars never travel through GraphQL as base64 data URLs.
 */
export class CreateAvatarImages1795000000000 implements MigrationInterface {
    name = 'CreateAvatarImages1795000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`avatar_images\` (
                \`id\` bigint NOT NULL AUTO_INCREMENT,
                \`data\` longblob NOT NULL,
                \`mime_type\` varchar(50) NOT NULL,
                \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`avatar_images\``);
    }
}
