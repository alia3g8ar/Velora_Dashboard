import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/modules/app/app.module';

type MigrationCommand = 'run' | 'show';

function readCommand(): MigrationCommand {
    const command = process.argv[2];

    if (command !== 'run' && command !== 'show') {
        throw new Error('Expected migration command: run or show');
    }

    return command;
}

async function showMigrations(dataSource: DataSource): Promise<void> {
    const migrationNames = dataSource.migrations.map(
        (migration) => migration.name ?? migration.constructor.name,
    );
    const migrationsTableName =
        dataSource.options.migrationsTableName ?? 'migrations';
    const queryRunner = dataSource.createQueryRunner();

    try {
        const hasMigrationsTable =
            await queryRunner.hasTable(migrationsTableName);
        let executedRows: Array<{ name: string }> = [];
        if (hasMigrationsTable) {
            const rows = (await queryRunner.query(
                `SELECT name FROM \`${migrationsTableName}\``,
            )) as Array<{ name: string }>;
            executedRows = rows;
        }
        const executedNames = new Set(
            executedRows.map((migration) => migration.name),
        );
        const executed = migrationNames.filter((name) =>
            executedNames.has(name),
        );
        const pending = migrationNames.filter(
            (name) => !executedNames.has(name),
        );

        console.log(`Executed migrations (${executed.length}):`);
        executed.forEach((name) => console.log(`  [X] ${name}`));
        console.log(`Pending migrations (${pending.length}):`);
        pending.forEach((name) => console.log(`  [ ] ${name}`));
    } finally {
        await queryRunner.release();
    }
}

async function manageMigrations(): Promise<void> {
    let app: INestApplicationContext | undefined;

    try {
        const command = readCommand();

        process.env.SYNCHRONIZE = 'false';
        app = await NestFactory.createApplicationContext(AppModule, {
            logger: false,
        });

        const dataSource = app.get(DataSource);

        if (command === 'show') {
            await showMigrations(dataSource);
            return;
        }

        const executed = await dataSource.runMigrations({
            transaction: 'each',
        });
        console.log(`Executed ${executed.length} migration(s).`);
        executed.forEach((migration) => console.log(`  [X] ${migration.name}`));
    } finally {
        if (app) {
            await app.close();
        }
    }
}

void manageMigrations().catch((error: unknown) => {
    const message =
        error instanceof Error ? error.message : 'Unknown migration error';
    console.error(`Migration command failed: ${message}`);
    process.exitCode = 1;
});
