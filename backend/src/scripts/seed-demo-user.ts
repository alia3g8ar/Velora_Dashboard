import { NestFactory } from '@nestjs/core';
import { hash } from 'bcrypt';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/modules/app/app.module';
import { DealStage } from 'src/modules/crm/entities/deal-stage.entity';
import { EventCategory } from 'src/modules/crm/entities/event-category.entity';
import { TaskStage } from 'src/modules/crm/entities/task-stage.entity';
import { User } from 'src/modules/crm/entities/user.entity';
import { Role } from 'src/modules/crm/enums';

/**
 * Non-destructive, idempotent seed of the demo login and reference data.
 *
 * Unlike `seed:demo` (which truncates the whole database), this script only
 * inserts rows that are missing. It is safe to run on any environment —
 * including production during a Vercel build — and can be re-run any number
 * of times. Business data (companies, contacts, deals, tasks, events, audits)
 * is never touched.
 *
 * Ensures:
 *  - the demo user (jim.halpert@dundermifflin.com / demodemo)
 *  - deal stages, task stages and event categories the UI depends on
 */
const DEMO_EMAIL = 'jim.halpert@dundermifflin.com';
const DEMO_PASSWORD = 'demodemo';

const DEAL_STAGES = ['NEW', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];
const TASK_STAGES = ['TODO', 'IN PROGRESS', 'IN REVIEW', 'DONE'];
const EVENT_CATEGORIES = ['Meeting', 'Call', 'Follow-up', 'Demo', 'Site Visit'];

async function ensureRows<T extends { title: string }>(
    repository: {
        findOneBy: (where: { title: string }) => Promise<T | null>;
        create: (data: { title: string }) => T;
        save: (row: T) => Promise<T>;
    },
    titles: string[],
    label: string,
): Promise<void> {
    for (const title of titles) {
        const existing = await repository.findOneBy({ title });
        if (existing) {
            console.log(`  [=] ${label} "${title}" already exists`);
            continue;
        }
        await repository.save(repository.create({ title }));
        console.log(`  [C] ${label} "${title}" created`);
    }
}

async function seedDemoUser(): Promise<void> {
    process.env.SYNCHRONIZE = 'false';

    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn'],
    });

    try {
        const dataSource: DataSource = app.get(DataSource);

        const userRepository = dataSource.getRepository(User);
        let demoUser = await userRepository.findOneBy({ email: DEMO_EMAIL });
        if (demoUser) {
            console.log(`  [=] demo user already exists (id ${demoUser.id})`);
        } else {
            demoUser = await userRepository.save(
                userRepository.create({
                    email: DEMO_EMAIL,
                    name: 'Jim Halpert',
                    password: await hash(DEMO_PASSWORD, 10),
                    role: Role.SALES_MANAGER,
                    jobTitle: 'Sales Manager',
                    phone: '+1 555 010 2345',
                    timezone: 'America/New_York',
                    avatarUrl: 'https://i.pravatar.cc/150?img=12',
                }),
            );
            console.log(`  [C] demo user created (id ${demoUser.id})`);
        }

        await ensureRows(
            dataSource.getRepository(DealStage),
            DEAL_STAGES,
            'deal stage',
        );
        await ensureRows(
            dataSource.getRepository(TaskStage),
            TASK_STAGES,
            'task stage',
        );
        await ensureRows(
            dataSource.getRepository(EventCategory),
            EVENT_CATEGORIES,
            'event category',
        );

        console.log(
            'Demo data ensured. Non-destructive — existing data untouched.',
        );
        console.log('Demo login:');
        console.log(`  email:    ${DEMO_EMAIL}`);
        console.log(`  password: ${DEMO_PASSWORD}`);
    } finally {
        await app.close();
    }
}

void seedDemoUser().catch((error: unknown) => {
    const message =
        error instanceof Error ? error.message : 'Unknown seed error';
    console.error(`Seed failed: ${message}`);
    process.exitCode = 1;
});
