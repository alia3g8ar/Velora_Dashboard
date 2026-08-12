import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/modules/app/app.module';
import { seedDemoData } from './seed-data';

async function seed(): Promise<void> {
    process.env.SYNCHRONIZE = 'false';

    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn'],
    });

    const dataSource = app.get(DataSource);

    try {
        const summary = await seedDemoData(dataSource);

        console.log('Seed completed:');
        console.table(summary.counts);
        console.log('Demo login:');
        console.log(`  email:    ${summary.demoEmail}`);
        console.log(`  password: ${summary.demoPassword}`);
    } finally {
        await app.close();
    }
}

void seed().catch((error: unknown) => {
    const message =
        error instanceof Error ? error.message : 'Unknown seed error';
    console.error(`Seed failed: ${message}`);
    process.exitCode = 1;
});
