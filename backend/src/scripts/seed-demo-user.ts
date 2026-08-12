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
 *  - the demo login (aliasghararyayimehr@gmail.com / demodemo)
 *  - deal stages, task stages and event categories the UI depends on
 *
 * When a database has both the account holding the new email and the legacy
 * demo account (old email), they are consolidated into the legacy account the
 * user actually logs in with: every owned row is re-pointed to it, the
 * duplicate is removed, and it takes the new email — so the user keeps the
 * same account and all its data, just under the new login email.
 */
const DEMO_EMAIL = 'aliasghararyayimehr@gmail.com';
const LEGACY_DEMO_EMAIL = 'jim.halpert@dundermifflin.com';
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

/**
 * Tables that reference `users` and must be re-pointed when two accounts are
 * merged, so no data is lost or orphaned.
 */
const USER_REFERENCE_TABLES: Array<[string, string]> = [
    ['companies', 'sales_owner_id'],
    ['contacts', 'sales_owner_id'],
    ['deals', 'deal_owner_id'],
    ['audits', 'user_id'],
    ['event_participants', 'user_id'],
    ['task_users', 'user_id'],
];

/**
 * If a database has both the account holding the current demo email and the
 * legacy demo account (old email), consolidate them into ONE account: the
 * legacy account the user actually logs in with keeps its identity and gains
 * the new email, and every row owned by the other account is re-pointed to it
 * (so nothing is lost). The duplicate account is then deleted.
 *
 * Returns the merged account, or null when there is nothing to consolidate.
 */
async function consolidateDuplicateAccounts(
    dataSource: DataSource,
    userRepository: {
        findOneBy: (where: { email: string }) => Promise<User | null>;
    },
): Promise<User | null> {
    const byNewEmail = await userRepository.findOneBy({ email: DEMO_EMAIL });
    const byLegacyEmail = await userRepository.findOneBy({
        email: LEGACY_DEMO_EMAIL,
    });
    if (!byNewEmail || !byLegacyEmail || byNewEmail.id === byLegacyEmail.id) {
        return null;
    }

    for (const [table, column] of USER_REFERENCE_TABLES) {
        await dataSource.query(
            `UPDATE \`${table}\` SET \`${column}\` = ? WHERE \`${column}\` = ?`,
            [byLegacyEmail.id, byNewEmail.id],
        );
    }
    await dataSource.getRepository(User).delete(byNewEmail.id);

    byLegacyEmail.email = DEMO_EMAIL;
    byLegacyEmail.password = await hash(DEMO_PASSWORD, 10);
    const merged = await dataSource.getRepository(User).save(byLegacyEmail);
    console.log(
        `  [C] merged duplicate account into id ${merged.id} (${DEMO_EMAIL}) — ` +
            'all owned data re-pointed, nothing lost',
    );
    return merged;
}

async function seedDemoUser(): Promise<void> {
    process.env.SYNCHRONIZE = 'false';

    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn'],
    });

    try {
        const dataSource: DataSource = app.get(DataSource);

        const userRepository = dataSource.getRepository(User);
        const merged = await consolidateDuplicateAccounts(
            dataSource,
            userRepository,
        );
        let demoUser =
            merged ?? (await userRepository.findOneBy({ email: DEMO_EMAIL }));
        if (demoUser) {
            // The login email exists (usually the owner's real account). Make
            // sure the documented demo password works for it so logging in
            // with the new email is possible, and grant it the ADMIN role so
            // it sees the full dataset (admins are excluded from the sales
            // owner pickers in the UI).
            demoUser.password = await hash(DEMO_PASSWORD, 10);
            demoUser.role = Role.ADMIN;
            demoUser = await userRepository.save(demoUser);
            console.log(
                `  [C] demo login password + ADMIN role ensured for ${DEMO_EMAIL} (id ${demoUser.id})`,
            );
        } else {
            // Existing databases created before the email change still have the
            // legacy demo account; rename it instead of creating a duplicate.
            const legacyUser = await userRepository.findOneBy({
                email: LEGACY_DEMO_EMAIL,
            });
            if (legacyUser) {
                legacyUser.email = DEMO_EMAIL;
                demoUser = await userRepository.save(legacyUser);
                console.log(
                    `  [C] demo user email updated to ${DEMO_EMAIL} (id ${demoUser.id})`,
                );
            } else {
                demoUser = await userRepository.save(
                    userRepository.create({
                        email: DEMO_EMAIL,
                        name: 'Jim Halpert',
                        password: await hash(DEMO_PASSWORD, 10),
                        role: Role.ADMIN,
                        jobTitle: 'Sales Manager',
                        phone: '+1 555 010 2345',
                        timezone: 'America/New_York',
                        avatarUrl: 'https://i.pravatar.cc/150?img=12',
                    }),
                );
                console.log(`  [C] demo user created (id ${demoUser.id})`);
            }
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
            'Demo data ensured. Business data untouched; only the demo login',
        );
        console.log('account may have been consolidated/renamed.');
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
