import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Performance indexes for the CRM hot paths.
 *
 * The base schema migration and the creators migration already index every
 * owner column (companies.sales_owner_id, contacts.company_id /
 * sales_owner_id, deals.company_id / deal_owner_id / stage_id / close_date,
 * tasks.stage_id / created_by_id, events.start_date / category_id /
 * created_by_id, audits.target_entity + target_id / user_id).
 *
 * This migration only adds the two composite indexes that are genuinely
 * missing and cover whole queries end-to-end:
 *
 * - `events (created_by_id, start_date)` — the dashboard "upcoming events"
 *   list filters by owner AND start_date >= today, then sorts by start_date;
 *   the composite serves the filter and the sort from one index.
 * - `audits (target_entity, created_at)` — the "latest activities" list
 *   filters by target entity and orders by created_at.
 */
export class AddOwnerAndLookupIndexes1794000000000 implements MigrationInterface {
    name = 'AddOwnerAndLookupIndexes1794000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE INDEX \`IDX_events_owner_start\` ON \`events\` (\`created_by_id\`, \`start_date\`)`,
        );
        await queryRunner.query(
            `CREATE INDEX \`IDX_audits_entity_created\` ON \`audits\` (\`target_entity\`, \`created_at\`)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX \`IDX_audits_entity_created\` ON \`audits\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_events_owner_start\` ON \`events\``,
        );
    }
}
