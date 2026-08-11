import { NestFactory } from '@nestjs/core';
import { DataSource, MigrationInterface } from 'typeorm';
import { AppModule } from 'src/modules/app/app.module';

/**
 * Deploy-time migration runner (Vercel build step).
 *
 * Runs pending TypeORM migrations against the production database. Unlike the
 * manual `migration:run` script this also handles the case where the schema
 * was created before migration tracking existed (e.g. by synchronize or a
 * manual setup): the initial schema migration is then *baselined* — recorded
 * as executed without re-running it — because its tables already exist.
 *
 * The WidenUserAvatarUrl migration is safe to run in every scenario: an
 * ALTER TABLE that widens a column is idempotent.
 */
const SCHEMA_BASELINE = 'CreateCrmSchema1790000000000';

type DeployMigration = MigrationInterface & { timestamp?: number };

async function tableExists(
    dataSource: DataSource,
    table: string,
): Promise<boolean> {
    const queryRunner = dataSource.createQueryRunner();
    try {
        return await queryRunner.hasTable(table);
    } finally {
        await queryRunner.release();
    }
}

async function ensureMigrationsTable(
    dataSource: DataSource,
    tableName: string,
): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    try {
        if (!(await queryRunner.hasTable(tableName))) {
            await queryRunner.query(
                `CREATE TABLE \`${tableName}\` (
                    \`id\` int NOT NULL AUTO_INCREMENT,
                    \`timestamp\` bigint NOT NULL,
                    \`name\` varchar(255) NOT NULL,
                    PRIMARY KEY (\`id\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
            );
        }
    } finally {
        await queryRunner.release();
    }
}

async function migrate(): Promise<void> {
    process.env.SYNCHRONIZE = 'false';

    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: false,
    });

    try {
        const dataSource: DataSource = app.get(DataSource);
        const migrationsTable =
            dataSource.options.migrationsTableName ?? 'migrations';

        await ensureMigrationsTable(dataSource, migrationsTable);

        const executedQueryRunner = dataSource.createQueryRunner();
        let executedRows: Array<{ name: string }> = [];
        try {
            executedRows = (await executedQueryRunner.query(
                `SELECT name FROM \`${migrationsTable}\``,
            )) as Array<{ name: string }>;
        } finally {
            await executedQueryRunner.release();
        }
        const executedNames = new Set(executedRows.map((row) => row.name));

        // If the schema already exists but was never tracked, record the
        // initial schema migration as executed instead of re-creating tables.
        const schemaMigration = (
            dataSource.migrations as DeployMigration[]
        ).find(
            (migration) =>
                (migration.name ?? migration.constructor.name) ===
                SCHEMA_BASELINE,
        );

        if (
            schemaMigration &&
            !executedNames.has(SCHEMA_BASELINE) &&
            (await tableExists(dataSource, 'users'))
        ) {
            const timestamp =
                schemaMigration.timestamp ??
                Number(SCHEMA_BASELINE.replace(/\D/g, ''));
            await dataSource.query(
                `INSERT INTO \`${migrationsTable}\` (\`timestamp\`, \`name\`) VALUES (?, ?)`,
                [timestamp, SCHEMA_BASELINE],
            );
            console.log(
                `  [B] ${SCHEMA_BASELINE} (schema already exists — baselined)`,
            );
            executedNames.add(SCHEMA_BASELINE);
        }

        const executed = await dataSource.runMigrations({
            transaction: 'each',
        });
        console.log(`Executed ${executed.length} migration(s).`);
        executed.forEach((migration) => console.log(`  [X] ${migration.name}`));

        const remaining = (dataSource.migrations as DeployMigration[]).filter(
            (migration) =>
                !executedNames.has(
                    migration.name ?? migration.constructor.name,
                ),
        );

        if (remaining.length === 0) {
            console.log('All migrations are up to date.');
        }
    } finally {
        await app.close();
    }
}

void migrate().catch((error: unknown) => {
    const message =
        error instanceof Error ? error.message : 'Unknown migration error';
    console.error(`Deploy migration failed: ${message}`);
    process.exitCode = 1;
});
