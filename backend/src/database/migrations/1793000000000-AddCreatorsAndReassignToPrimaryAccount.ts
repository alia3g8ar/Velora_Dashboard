import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Makes the app multi-tenant (each user only sees their own data).
 *
 * 1. Adds `created_by_id` to `tasks` and `events` so every row has a clear
 *    owner. Existing rows are backfilled from their join tables (the first
 *    user that was assigned / participated).
 *
 * 2. Reassigns ALL pre-existing CRM data to the primary account
 *    (aliasghararyayimehr@gmail.com). Before this change the app was
 *    single-tenant, so every company, contact, deal, task, event and audit
 *    row is the owner's data regardless of which seeded user id it carried.
 *    This runs exactly once per environment (TypeORM tracks applied
 *    migrations); new registrations start empty and only ever see rows they
 *    created.
 *
 * The migration is deliberately idempotent (guarded DDL + collision-safe
 * reassignment) so an interrupted run can be retried safely. The reassignment
 * itself is guarded by EXISTS so a fresh database (no users, no data yet) is
 * a no-op.
 */
export class AddCreatorsAndReassignToPrimaryAccount1793000000000 implements MigrationInterface {
    name = 'AddCreatorsAndReassignToPrimaryAccount1793000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ------------------------------------------------------------------
        // 1. created_by_id columns
        // ------------------------------------------------------------------
        await this.addColumnIfMissing(
            queryRunner,
            'tasks',
            'created_by_id',
            `
            ALTER TABLE \`tasks\`
                ADD COLUMN \`created_by_id\` int NULL AFTER \`completed\`
        `,
        );
        await this.addColumnIfMissing(
            queryRunner,
            'events',
            'created_by_id',
            `
            ALTER TABLE \`events\`
                ADD COLUMN \`created_by_id\` int NULL AFTER \`color\`
        `,
        );

        // Backfill from the join tables (the first assigned/participating
        // user), so existing rows keep a sensible creator.
        await queryRunner.query(`
            UPDATE \`tasks\` t
            LEFT JOIN (
                SELECT task_id, MIN(user_id) AS user_id
                FROM \`task_users\`
                GROUP BY task_id
            ) tu ON tu.task_id = t.id
            SET t.created_by_id = tu.user_id
            WHERE t.created_by_id IS NULL
        `);
        await queryRunner.query(`
            UPDATE \`events\` e
            LEFT JOIN (
                SELECT event_id, MIN(user_id) AS user_id
                FROM \`event_participants\`
                GROUP BY event_id
            ) ep ON ep.event_id = e.id
            SET e.created_by_id = ep.user_id
            WHERE e.created_by_id IS NULL
        `);

        // Foreign keys + indexes.
        await this.addForeignKeyIfMissing(
            queryRunner,
            'FK_tasks_created_by',
            `
                ALTER TABLE \`tasks\`
                    ADD CONSTRAINT \`FK_tasks_created_by\`
                        FOREIGN KEY (\`created_by_id\`) REFERENCES \`users\`(\`id\`)
                        ON DELETE SET NULL
            `,
        );
        await this.addIndexIfMissing(
            queryRunner,
            'tasks',
            'IDX_tasks_created_by',
            `
            CREATE INDEX \`IDX_tasks_created_by\`
                ON \`tasks\` (\`created_by_id\`)
        `,
        );
        await this.addForeignKeyIfMissing(
            queryRunner,
            'FK_events_created_by',
            `
                ALTER TABLE \`events\`
                    ADD CONSTRAINT \`FK_events_created_by\`
                        FOREIGN KEY (\`created_by_id\`) REFERENCES \`users\`(\`id\`)
                        ON DELETE SET NULL
            `,
        );
        await this.addIndexIfMissing(
            queryRunner,
            'events',
            'IDX_events_created_by',
            `
                CREATE INDEX \`IDX_events_created_by\`
                    ON \`events\` (\`created_by_id\`)
            `,
        );

        // ------------------------------------------------------------------
        // 2. Reassign every existing row to the primary account
        // ------------------------------------------------------------------
        const hasPrimary = (await queryRunner.query(`
            SELECT COUNT(*) AS count
            FROM \`users\`
            WHERE \`email\` = 'aliasghararyayimehr@gmail.com'
        `)) as Array<{ count: number }>;
        if (Number(hasPrimary?.[0]?.count ?? 0) === 0) {
            return;
        }
        const primaryId = `
            (SELECT \`id\` FROM \`users\`
             WHERE \`email\` = 'aliasghararyayimehr@gmail.com' LIMIT 1)
        `;

        const reassign: Array<[string, string]> = [
            ['companies', 'sales_owner_id'],
            ['contacts', 'sales_owner_id'],
            ['deals', 'deal_owner_id'],
            ['audits', 'user_id'],
        ];
        for (const [table, column] of reassign) {
            await queryRunner.query(
                `UPDATE \`${table}\` SET \`${column}\` = ${primaryId}`,
            );
        }

        // Many-to-many join tables need a collision-safe merge: multiple
        // assignees of the same task must collapse into one row per task.
        await this.mergeJoinTableToUser(queryRunner, 'task_users', 'task_id');
        await this.mergeJoinTableToUser(
            queryRunner,
            'event_participants',
            'event_id',
        );

        // Newly added creator columns follow the same rule.
        await queryRunner.query(
            `UPDATE \`tasks\` SET \`created_by_id\` = ${primaryId}`,
        );
        await queryRunner.query(
            `UPDATE \`events\` SET \`created_by_id\` = ${primaryId}`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX \`IDX_events_created_by\` ON \`events\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_events_created_by\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`events\` DROP COLUMN \`created_by_id\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_tasks_created_by\` ON \`tasks\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tasks\` DROP FOREIGN KEY \`FK_tasks_created_by\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tasks\` DROP COLUMN \`created_by_id\``,
        );
    }

    private async addColumnIfMissing(
        queryRunner: QueryRunner,
        table: string,
        column: string,
        ddl: string,
    ): Promise<void> {
        const rows = (await queryRunner.query(
            `SHOW COLUMNS FROM \`${table}\` LIKE '${column}'`,
        )) as unknown[];
        if (Array.isArray(rows) && rows.length > 0) {
            return;
        }
        await queryRunner.query(ddl);
    }

    private async addForeignKeyIfMissing(
        queryRunner: QueryRunner,
        constraintName: string,
        ddl: string,
    ): Promise<void> {
        const rows = (await queryRunner.query(`
            SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
            WHERE CONSTRAINT_SCHEMA = DATABASE()
              AND CONSTRAINT_TYPE = 'FOREIGN KEY'
              AND CONSTRAINT_NAME = '${constraintName}'
        `)) as unknown[];
        if (Array.isArray(rows) && rows.length > 0) {
            return;
        }
        await queryRunner.query(ddl);
    }

    private async addIndexIfMissing(
        queryRunner: QueryRunner,
        table: string,
        indexName: string,
        ddl: string,
    ): Promise<void> {
        const rows = (await queryRunner.query(
            `SHOW INDEX FROM \`${table}\` WHERE Key_name = '${indexName}'`,
        )) as unknown[];
        if (Array.isArray(rows) && rows.length > 0) {
            return;
        }
        await queryRunner.query(ddl);
    }

    private async mergeJoinTableToUser(
        queryRunner: QueryRunner,
        table: string,
        fkColumn: string,
    ): Promise<void> {
        const primaryId = `
            (SELECT \`id\` FROM \`users\`
             WHERE \`email\` = 'aliasghararyayimehr@gmail.com' LIMIT 1)
        `;
        // Drop non-primary rows that would collide with an existing
        // primary-account row for the same parent, then re-point the rest.
        await queryRunner.query(`
            DELETE FROM \`${table}\`
            WHERE \`user_id\` != ${primaryId}
              AND \`${fkColumn}\` IN (
                  SELECT \`${fkColumn}\` FROM (
                      SELECT DISTINCT \`${fkColumn}\`
                      FROM \`${table}\`
                      WHERE \`user_id\` = ${primaryId}
                  ) AS existing_primary
              )
        `);
        await queryRunner.query(
            `UPDATE \`${table}\` SET \`user_id\` = ${primaryId}
             WHERE \`user_id\` != ${primaryId}`,
        );
    }
}
