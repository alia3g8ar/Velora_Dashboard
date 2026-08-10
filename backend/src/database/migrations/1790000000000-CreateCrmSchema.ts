import { MigrationInterface, QueryRunner } from 'typeorm';

const enumValues = (values: string[]): string =>
    values.map((value) => `'${value}'`).join(', ');

export class CreateCrmSchema1790000000000 implements MigrationInterface {
    name = 'CreateCrmSchema1790000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NULL,
                \`email\` varchar(255) NOT NULL,
                \`password\` varchar(255) NULL,
                \`role\` varchar(32) NOT NULL DEFAULT 'SALES_INTERN',
                \`phone\` varchar(20) NULL,
                \`job_title\` varchar(255) NULL,
                \`timezone\` varchar(64) NULL,
                \`avatar_url\` varchar(500) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                UNIQUE INDEX \`IDX_users_email\` (\`email\`),
                CONSTRAINT \`CHK_users_role\` CHECK (\`role\` IN (${enumValues(['ADMIN', 'SALES_MANAGER', 'SALES_PERSON', 'SALES_INTERN'])}))
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`
            CREATE TABLE \`companies\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`avatar_url\` varchar(500) NULL,
                \`total_revenue\` int NULL,
                \`industry\` varchar(64) NULL,
                \`company_size\` varchar(32) NULL,
                \`business_type\` varchar(16) NULL,
                \`country\` varchar(128) NULL,
                \`website\` varchar(255) NULL,
                \`sales_owner_id\` int NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_companies_sales_owner\` (\`sales_owner_id\`),
                CONSTRAINT \`FK_companies_sales_owner\` FOREIGN KEY (\`sales_owner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION,
                CONSTRAINT \`CHK_companies_business_type\` CHECK (\`business_type\` IS NULL OR \`business_type\` IN (${enumValues(['B2B', 'B2C', 'B2G'])}))
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`
            CREATE TABLE \`contacts\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`avatar_url\` varchar(500) NULL,
                \`email\` varchar(255) NOT NULL,
                \`phone\` varchar(32) NULL,
                \`job_title\` varchar(255) NULL,
                \`timezone\` varchar(64) NULL,
                \`status\` varchar(32) NOT NULL DEFAULT 'NEW',
                \`stage\` varchar(32) NOT NULL DEFAULT 'LEAD',
                \`score\` int NULL,
                \`company_id\` int NOT NULL,
                \`sales_owner_id\` int NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_contacts_company\` (\`company_id\`),
                INDEX \`IDX_contacts_sales_owner\` (\`sales_owner_id\`),
                CONSTRAINT \`FK_contacts_company\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT \`FK_contacts_sales_owner\` FOREIGN KEY (\`sales_owner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION,
                CONSTRAINT \`CHK_contacts_status\` CHECK (\`status\` IN (${enumValues(['NEW', 'QUALIFIED', 'UNQUALIFIED', 'WON', 'NEGOTIATION', 'LOST', 'INTERESTED', 'CONTACTED', 'CHURNED'])})),
                CONSTRAINT \`CHK_contacts_stage\` CHECK (\`stage\` IN (${enumValues(['CUSTOMER', 'LEAD', 'SALES_QUALIFIED_LEAD'])}))
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`
            CREATE TABLE \`deal_stages\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`title\` varchar(64) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`
            CREATE TABLE \`deals\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`title\` varchar(255) NOT NULL,
                \`value\` float NULL,
                \`notes\` text NULL,
                \`close_date\` datetime(6) NULL,
                \`close_date_day\` int NULL,
                \`close_date_month\` int NULL,
                \`close_date_year\` int NULL,
                \`company_id\` int NOT NULL,
                \`deal_owner_id\` int NOT NULL,
                \`deal_contact_id\` int NULL,
                \`stage_id\` int NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_deals_company\` (\`company_id\`),
                INDEX \`IDX_deals_deal_owner\` (\`deal_owner_id\`),
                INDEX \`IDX_deals_contact\` (\`deal_contact_id\`),
                INDEX \`IDX_deals_stage\` (\`stage_id\`),
                INDEX \`IDX_deals_close_date\` (\`close_date\`),
                CONSTRAINT \`FK_deals_company\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT \`FK_deals_deal_owner\` FOREIGN KEY (\`deal_owner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION,
                CONSTRAINT \`FK_deals_contact\` FOREIGN KEY (\`deal_contact_id\`) REFERENCES \`contacts\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION,
                CONSTRAINT \`FK_deals_stage\` FOREIGN KEY (\`stage_id\`) REFERENCES \`deal_stages\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`
            CREATE TABLE \`task_stages\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`title\` varchar(64) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`
            CREATE TABLE \`tasks\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`title\` varchar(255) NOT NULL,
                \`description\` text NULL,
                \`due_date\` datetime(6) NULL,
                \`completed\` tinyint(1) NOT NULL DEFAULT 0,
                \`checklist\` json NULL,
                \`stage_id\` int NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_tasks_stage\` (\`stage_id\`),
                CONSTRAINT \`FK_tasks_stage\` FOREIGN KEY (\`stage_id\`) REFERENCES \`task_stages\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`
            CREATE TABLE \`task_users\` (
                \`task_id\` int NOT NULL,
                \`user_id\` int NOT NULL,
                PRIMARY KEY (\`task_id\`, \`user_id\`),
                INDEX \`IDX_task_users_user\` (\`user_id\`),
                CONSTRAINT \`FK_task_users_task\` FOREIGN KEY (\`task_id\`) REFERENCES \`tasks\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT \`FK_task_users_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`
            CREATE TABLE \`event_categories\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`title\` varchar(128) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`
            CREATE TABLE \`events\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`title\` varchar(255) NOT NULL,
                \`description\` text NULL,
                \`color\` varchar(16) NOT NULL DEFAULT '#1677FF',
                \`start_date\` datetime(6) NOT NULL,
                \`end_date\` datetime(6) NOT NULL,
                \`category_id\` int NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_events_start_date\` (\`start_date\`),
                INDEX \`IDX_events_category\` (\`category_id\`),
                CONSTRAINT \`FK_events_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`event_categories\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`
            CREATE TABLE \`event_participants\` (
                \`event_id\` int NOT NULL,
                \`user_id\` int NOT NULL,
                PRIMARY KEY (\`event_id\`, \`user_id\`),
                INDEX \`IDX_event_participants_user\` (\`user_id\`),
                CONSTRAINT \`FK_event_participants_event\` FOREIGN KEY (\`event_id\`) REFERENCES \`events\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT \`FK_event_participants_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`
            CREATE TABLE \`audits\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`action\` varchar(32) NOT NULL,
                \`target_entity\` varchar(64) NOT NULL,
                \`target_id\` int NOT NULL,
                \`changes\` json NULL,
                \`user_id\` int NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_audits_target\` (\`target_entity\`, \`target_id\`),
                INDEX \`IDX_audits_user\` (\`user_id\`),
                CONSTRAINT \`FK_audits_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`audits\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`event_participants\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`events\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`event_categories\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`task_users\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`tasks\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`task_stages\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`deals\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`deal_stages\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`contacts\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`companies\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`users\``);
    }
}
