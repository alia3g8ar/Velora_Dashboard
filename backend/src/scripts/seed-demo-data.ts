import { NestFactory } from '@nestjs/core';
import { hash } from 'bcrypt';
import { DataSource, In } from 'typeorm';
import { requestContext } from 'src/common/context/request-context';
import { AppModule } from 'src/modules/app/app.module';
import { Audit } from 'src/modules/crm/entities/audit.entity';
import { Company } from 'src/modules/crm/entities/company.entity';
import { Contact } from 'src/modules/crm/entities/contact.entity';
import { DealStage } from 'src/modules/crm/entities/deal-stage.entity';
import { Deal } from 'src/modules/crm/entities/deal.entity';
import { EventCategory } from 'src/modules/crm/entities/event-category.entity';
import { Event } from 'src/modules/crm/entities/event.entity';
import { TaskStage } from 'src/modules/crm/entities/task-stage.entity';
import { Task } from 'src/modules/crm/entities/task.entity';
import { User } from 'src/modules/crm/entities/user.entity';
import {
    BusinessType,
    CompanySize,
    ContactStage,
    ContactStatus,
    Industry,
    Role,
} from 'src/modules/crm/enums';

const DEMO_EMAIL = 'aliasghararyayimehr@gmail.com';
const DEMO_PASSWORD = 'demodemo';

const monthsAgo = (months: number, day = 15, hour = 12): Date => {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    date.setDate(day);
    date.setHours(hour, 0, 0, 0);
    return date;
};

const daysFromNow = (days: number, hour = 10, minute = 0): Date => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hour, minute, 0, 0);
    return date;
};

async function seed(): Promise<void> {
    process.env.SYNCHRONIZE = 'false';

    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn'],
    });

    const dataSource = app.get(DataSource);

    try {
        await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
        for (const table of [
            'audits',
            'event_participants',
            'events',
            'event_categories',
            'task_users',
            'tasks',
            'task_stages',
            'deals',
            'deal_stages',
            'contacts',
            'companies',
            'users',
        ]) {
            await dataSource.query(`TRUNCATE TABLE \`${table}\``);
        }
        await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

        // ------------------------------------------------------------------
        // Users
        // ------------------------------------------------------------------
        const userRepository = dataSource.getRepository(User);

        const demoUser = await userRepository.save(
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

        const salesTeam = await userRepository.save([
            userRepository.create({
                email: 'pam.beesly@dundermifflin.com',
                name: 'Pam Beesly',
                password: await hash('demodemo', 10),
                role: Role.SALES_PERSON,
                jobTitle: 'Sales Executive',
                timezone: 'America/New_York',
                avatarUrl: 'https://i.pravatar.cc/150?img=47',
            }),
            userRepository.create({
                email: 'dwight.schrute@dundermifflin.com',
                name: 'Dwight Schrute',
                password: await hash('demodemo', 10),
                role: Role.SALES_PERSON,
                jobTitle: 'Senior Sales Executive',
                timezone: 'America/New_York',
                avatarUrl: 'https://i.pravatar.cc/150?img=13',
            }),
            userRepository.create({
                email: 'michael.scott@dundermifflin.com',
                name: 'Michael Scott',
                password: await hash('demodemo', 10),
                role: Role.SALES_INTERN,
                jobTitle: 'Sales Intern',
                timezone: 'America/New_York',
                avatarUrl: 'https://i.pravatar.cc/150?img=11',
            }),
            userRepository.create({
                email: 'angela.martin@dundermifflin.com',
                name: 'Angela Martin',
                password: await hash('demodemo', 10),
                role: Role.ADMIN,
                jobTitle: 'Accountant',
                timezone: 'America/New_York',
                avatarUrl: 'https://i.pravatar.cc/150?img=32',
            }),
        ]);

        // ------------------------------------------------------------------
        // Stages & categories
        // ------------------------------------------------------------------
        const dealStageRepository = dataSource.getRepository(DealStage);
        const dealStages = await dealStageRepository.save([
            dealStageRepository.create({ title: 'NEW' }),
            dealStageRepository.create({ title: 'QUALIFIED' }),
            dealStageRepository.create({ title: 'PROPOSAL' }),
            dealStageRepository.create({ title: 'WON' }),
            dealStageRepository.create({ title: 'LOST' }),
        ]);
        const stageByTitle = Object.fromEntries(
            dealStages.map((stage) => [stage.title, stage]),
        );

        const taskStageRepository = dataSource.getRepository(TaskStage);
        const taskStages = await taskStageRepository.save([
            taskStageRepository.create({ title: 'TODO' }),
            taskStageRepository.create({ title: 'IN PROGRESS' }),
            taskStageRepository.create({ title: 'IN REVIEW' }),
            taskStageRepository.create({ title: 'DONE' }),
        ]);

        const eventCategoryRepository = dataSource.getRepository(EventCategory);
        const categories = await eventCategoryRepository.save([
            eventCategoryRepository.create({ title: 'Meeting' }),
            eventCategoryRepository.create({ title: 'Call' }),
            eventCategoryRepository.create({ title: 'Follow-up' }),
            eventCategoryRepository.create({ title: 'Demo' }),
            eventCategoryRepository.create({ title: 'Site Visit' }),
        ]);

        // ------------------------------------------------------------------
        // Companies
        // ------------------------------------------------------------------
        const companyRepository = dataSource.getRepository(Company);

        const companyData: Array<
            Pick<
                Company,
                | 'name'
                | 'industry'
                | 'companySize'
                | 'businessType'
                | 'country'
                | 'website'
                | 'totalRevenue'
                | 'salesOwnerId'
            >
        > = [
            {
                name: 'Dunder Mifflin Inc.',
                industry: Industry.PROFESSIONAL_SERVICES,
                companySize: CompanySize.MEDIUM,
                businessType: BusinessType.B2B,
                country: 'United States',
                website: 'https://dundermifflin.com',
                totalRevenue: 1250000,
                salesOwnerId: demoUser.id,
            },
            {
                name: 'Vandelay Industries',
                industry: Industry.CONSTRUCTION,
                companySize: CompanySize.LARGE,
                businessType: BusinessType.B2B,
                country: 'United States',
                website: 'https://vandelay.io',
                totalRevenue: 980000,
                salesOwnerId: salesTeam[0].id,
            },
            {
                name: 'Stark Industries',
                industry: Industry.DEFENSE,
                companySize: CompanySize.ENTERPRISE,
                businessType: BusinessType.B2G,
                country: 'United States',
                website: 'https://starkindustries.com',
                totalRevenue: 4200000,
                salesOwnerId: salesTeam[1].id,
            },
            {
                name: 'Wayne Enterprises',
                industry: Industry.INDUSTRIAL_MANUFACTURING,
                companySize: CompanySize.ENTERPRISE,
                businessType: BusinessType.B2C,
                country: 'United States',
                website: 'https://wayneenterprises.com',
                totalRevenue: 3100000,
                salesOwnerId: demoUser.id,
            },
            {
                name: 'Initech',
                industry: Industry.TECHNOLOGY,
                companySize: CompanySize.SMALL,
                businessType: BusinessType.B2B,
                country: 'United States',
                website: 'https://initech.com',
                totalRevenue: 240000,
                salesOwnerId: salesTeam[0].id,
            },
            {
                name: 'Globex Corporation',
                industry: Industry.CHEMICALS,
                companySize: CompanySize.LARGE,
                businessType: BusinessType.B2B,
                country: 'Germany',
                website: 'https://globex.de',
                totalRevenue: 1750000,
                salesOwnerId: salesTeam[2].id,
            },
            {
                name: 'Hooli',
                industry: Industry.TECHNOLOGY,
                companySize: CompanySize.ENTERPRISE,
                businessType: BusinessType.B2B,
                country: 'United States',
                website: 'https://hooli.com',
                totalRevenue: 2800000,
                salesOwnerId: salesTeam[1].id,
            },
            {
                name: 'Pied Piper',
                industry: Industry.TECHNOLOGY,
                companySize: CompanySize.SMALL,
                businessType: BusinessType.B2C,
                country: 'United States',
                website: 'https://piedpiper.com',
                totalRevenue: 850000,
                salesOwnerId: demoUser.id,
            },
            {
                name: 'Acme Corporation',
                industry: Industry.RETAIL,
                companySize: CompanySize.LARGE,
                businessType: BusinessType.B2C,
                country: 'United Kingdom',
                website: 'https://acme.co.uk',
                totalRevenue: 1350000,
                salesOwnerId: salesTeam[3].id,
            },
            {
                name: 'Umbrella Corporation',
                industry: Industry.LIFE_SCIENCES,
                companySize: CompanySize.ENTERPRISE,
                businessType: BusinessType.B2B,
                country: 'Japan',
                website: 'https://umbrella.jp',
                totalRevenue: 2200000,
                salesOwnerId: salesTeam[2].id,
            },
        ];

        const companies = await companyRepository.save(
            companyData.map((data) => companyRepository.create(data)),
        );

        // ------------------------------------------------------------------
        // Contacts
        // ------------------------------------------------------------------
        const contactRepository = dataSource.getRepository(Contact);

        const contactData: Array<{
            name: string;
            email: string;
            phone: string;
            jobTitle: string;
            status: ContactStatus;
            stage: ContactStage;
            score: number;
            companyId: number;
            salesOwnerId: number;
        }> = [
            {
                name: 'Roy Anderson',
                email: 'roy@dundermifflin.com',
                phone: '+1 555 010 1001',
                jobTitle: 'Procurement Lead',
                status: ContactStatus.CONTACTED,
                stage: ContactStage.LEAD,
                score: 42,
                companyId: companies[0].id,
                salesOwnerId: demoUser.id,
            },
            {
                name: 'Kelly Kapoor',
                email: 'kelly@dundermifflin.com',
                phone: '+1 555 010 1002',
                jobTitle: 'IT Director',
                status: ContactStatus.QUALIFIED,
                stage: ContactStage.SALES_QUALIFIED_LEAD,
                score: 68,
                companyId: companies[0].id,
                salesOwnerId: demoUser.id,
            },
            {
                name: 'Art Vandelay',
                email: 'art@vandelay.io',
                phone: '+1 555 010 2001',
                jobTitle: 'CEO',
                status: ContactStatus.NEGOTIATION,
                stage: ContactStage.SALES_QUALIFIED_LEAD,
                score: 81,
                companyId: companies[1].id,
                salesOwnerId: salesTeam[0].id,
            },
            {
                name: 'Virginia Vandelay',
                email: 'virginia@vandelay.io',
                phone: '+1 555 010 2002',
                jobTitle: 'COO',
                status: ContactStatus.INTERESTED,
                stage: ContactStage.LEAD,
                score: 55,
                companyId: companies[1].id,
                salesOwnerId: salesTeam[0].id,
            },
            {
                name: 'Pepper Potts',
                email: 'pepper@starkindustries.com',
                phone: '+1 555 010 3001',
                jobTitle: 'Chief of Staff',
                status: ContactStatus.WON,
                stage: ContactStage.CUSTOMER,
                score: 95,
                companyId: companies[2].id,
                salesOwnerId: salesTeam[1].id,
            },
            {
                name: 'Happy Hogan',
                email: 'happy@starkindustries.com',
                phone: '+1 555 010 3002',
                jobTitle: 'Head of Security',
                status: ContactStatus.NEW,
                stage: ContactStage.LEAD,
                score: 20,
                companyId: companies[2].id,
                salesOwnerId: salesTeam[1].id,
            },
            {
                name: 'Lucius Fox',
                email: 'lucius@wayneenterprises.com',
                phone: '+1 555 010 4001',
                jobTitle: 'CFO',
                status: ContactStatus.QUALIFIED,
                stage: ContactStage.SALES_QUALIFIED_LEAD,
                score: 72,
                companyId: companies[3].id,
                salesOwnerId: demoUser.id,
            },
            {
                name: 'Milton Waddams',
                email: 'milton@initech.com',
                phone: '+1 555 010 5001',
                jobTitle: 'Office Manager',
                status: ContactStatus.LOST,
                stage: ContactStage.LEAD,
                score: 15,
                companyId: companies[4].id,
                salesOwnerId: salesTeam[0].id,
            },
            {
                name: 'Hank Scorpio',
                email: 'hank@globex.de',
                phone: '+49 555 010 6001',
                jobTitle: 'VP Operations',
                status: ContactStatus.NEGOTIATION,
                stage: ContactStage.SALES_QUALIFIED_LEAD,
                score: 77,
                companyId: companies[5].id,
                salesOwnerId: salesTeam[2].id,
            },
            {
                name: 'Gavin Belson',
                email: 'gavin@hooli.com',
                phone: '+1 555 010 7001',
                jobTitle: 'CEO',
                status: ContactStatus.CONTACTED,
                stage: ContactStage.LEAD,
                score: 60,
                companyId: companies[6].id,
                salesOwnerId: salesTeam[1].id,
            },
            {
                name: 'Richard Hendricks',
                email: 'richard@piedpiper.com',
                phone: '+1 555 010 8001',
                jobTitle: 'Founder',
                status: ContactStatus.WON,
                stage: ContactStage.CUSTOMER,
                score: 90,
                companyId: companies[7].id,
                salesOwnerId: demoUser.id,
            },
            {
                name: 'Wile E. Coyote',
                email: 'wile@acme.co.uk',
                phone: '+44 555 010 9001',
                jobTitle: 'Head of R&D',
                status: ContactStatus.INTERESTED,
                stage: ContactStage.LEAD,
                score: 48,
                companyId: companies[8].id,
                salesOwnerId: salesTeam[3].id,
            },
            {
                name: 'Albert Wesker',
                email: 'albert@umbrella.jp',
                phone: '+81 555 010 0001',
                jobTitle: 'Executive Director',
                status: ContactStatus.CHURNED,
                stage: ContactStage.CUSTOMER,
                score: 33,
                companyId: companies[9].id,
                salesOwnerId: salesTeam[2].id,
            },
        ];

        await contactRepository.save(
            contactData.map((data) => contactRepository.create(data)),
        );

        // ------------------------------------------------------------------
        // Deals — wrapped in the demo user's request context so the audit
        // subscriber attributes the CREATE records to them.
        // ------------------------------------------------------------------
        const dealRepository = dataSource.getRepository(Deal);

        await requestContext.run(
            { userId: demoUser.id, role: demoUser.role },
            async () => {
                const deals: Array<
                    Pick<
                        Deal,
                        | 'title'
                        | 'value'
                        | 'closeDate'
                        | 'companyId'
                        | 'dealOwnerId'
                        | 'stageId'
                    >
                > = [];

                const contacts = await contactRepository.find();

                const ownerOf = (company: Company): number =>
                    company.salesOwnerId;

                // WON deals across the last 8 months — powers the deals chart.
                const wonTitles = [
                    'Enterprise license renewal',
                    'Implementation services',
                    'Annual subscription package',
                    'Managed services contract',
                    'Hardware refresh program',
                    'Training & onboarding bundle',
                    'Support escalation plan',
                    'Data migration project',
                    'Security audit package',
                    'Custom integrations suite',
                ];
                wonTitles.forEach((title, index) => {
                    deals.push({
                        title,
                        value: 18000 + index * 12500,
                        closeDate: monthsAgo(7 - (index % 8)),
                        companyId: companies[index % companies.length].id,
                        dealOwnerId: ownerOf(
                            companies[index % companies.length],
                        ),
                        stageId: stageByTitle['WON'].id,
                    });
                });

                // LOST deals across the same window — the chart shows both lines.
                const lostTitles = [
                    'Proposed partnership',
                    'Pilot program',
                    'Volume discount deal',
                    'Expansion proposal',
                    'Renewal negotiation',
                    'Competitive bid',
                ];
                lostTitles.forEach((title, index) => {
                    deals.push({
                        title,
                        value: 9000 + index * 8000,
                        closeDate: monthsAgo(6 - (index % 7)),
                        companyId: companies[(index + 3) % companies.length].id,
                        dealOwnerId: ownerOf(
                            companies[(index + 3) % companies.length],
                        ),
                        stageId: stageByTitle['LOST'].id,
                    });
                });

                // Open pipeline deals with expected close dates.
                const pipelineTitles = [
                    'Quarterly license top-up',
                    'Consulting engagement',
                    'New territory rollout',
                    'Platform migration',
                    'Premium support tier',
                ];
                pipelineTitles.forEach((title, index) => {
                    deals.push({
                        title,
                        value: 15000 + index * 16000,
                        closeDate: daysFromNow(20 + index * 12),
                        companyId: companies[(index + 5) % companies.length].id,
                        dealOwnerId: ownerOf(
                            companies[(index + 5) % companies.length],
                        ),
                        stageId: [
                            stageByTitle['NEW'],
                            stageByTitle['QUALIFIED'],
                            stageByTitle['PROPOSAL'],
                        ][index % 3].id,
                    });
                });

                await dealRepository.save(
                    deals.map((data) => dealRepository.create(data)),
                );

                const contactById = Object.fromEntries(
                    contacts.map((contact) => [contact.companyId, contact]),
                );
                // Attach a contact reference to each deal where one exists.
                const savedDeals = await dealRepository.find();
                for (const deal of savedDeals) {
                    const contact = contactById[deal.companyId];
                    if (contact) {
                        deal.dealContactId = contact.id;
                    }
                }
                await dealRepository.save(savedDeals);
            },
        );

        // ------------------------------------------------------------------
        // Tasks
        // ------------------------------------------------------------------
        const taskRepository = dataSource.getRepository(Task);

        const taskData: Array<{
            title: string;
            description?: string;
            dueDate: Date;
            completed: boolean;
            stageId?: number | null;
            userIds: number[];
            checklist?: { title: string; checked: boolean }[];
        }> = [
            {
                title: 'Prepare quarterly forecast',
                description:
                    'Consolidate pipeline data from all sales executives.',
                dueDate: daysFromNow(2, 17),
                completed: false,
                stageId: taskStages[1].id, // IN PROGRESS
                userIds: [demoUser.id, salesTeam[0].id],
                checklist: [
                    { title: 'Gather numbers', checked: true },
                    { title: 'Draft slides', checked: false },
                ],
            },
            {
                title: 'Follow up with Vandelay Industries',
                description: 'Send the revised proposal and pricing sheet.',
                dueDate: daysFromNow(1, 9),
                completed: false,
                stageId: taskStages[1].id,
                userIds: [salesTeam[0].id],
            },
            {
                title: 'Demo call with Hooli',
                description: 'Product demo for the VP of Engineering.',
                dueDate: daysFromNow(3, 14),
                completed: false,
                stageId: taskStages[2].id, // IN REVIEW
                userIds: [salesTeam[1].id, demoUser.id],
            },
            {
                title: 'Review contract with legal',
                description: 'Check the MSA before sending to Acme.',
                dueDate: daysFromNow(-1, 11),
                completed: true,
                stageId: taskStages[3].id, // DONE
                userIds: [salesTeam[3].id],
            },
            {
                title: 'Onboard new intern',
                description: 'Walk through the CRM and sales playbook.',
                dueDate: daysFromNow(5, 10),
                completed: false,
                stageId: taskStages[0].id, // TODO
                userIds: [demoUser.id, salesTeam[2].id],
            },
            {
                title: 'Update deal values in pipeline',
                dueDate: daysFromNow(4, 16),
                completed: false,
                stageId: taskStages[0].id,
                userIds: [salesTeam[1].id],
            },
            {
                title: 'Send thank-you notes to WON accounts',
                dueDate: daysFromNow(-2, 15),
                completed: true,
                stageId: taskStages[3].id,
                userIds: [salesTeam[2].id],
            },
            {
                title: 'Prepare site visit for Umbrella',
                description: 'Book travel and arrange the on-site agenda.',
                dueDate: daysFromNow(7, 9),
                completed: false,
                stageId: taskStages[0].id,
                userIds: [salesTeam[2].id, demoUser.id],
            },
            {
                title: 'Churn risk review',
                description: 'Analyze contacts flagged as CHURNED.',
                dueDate: daysFromNow(6, 13),
                completed: false,
                stageId: taskStages[1].id,
                userIds: [salesTeam[3].id],
            },
            {
                title: 'Publish Q3 playbook',
                dueDate: daysFromNow(9, 12),
                completed: false,
                stageId: taskStages[0].id,
                userIds: [demoUser.id],
            },
        ];

        await taskRepository.save(
            taskData.map((data) => {
                // userIds is assigned through the join table below.
                const { userIds, ...scalars } = data;
                void userIds;
                return taskRepository.create({
                    ...scalars,
                    createdByUserId: demoUser.id,
                });
            }),
        );

        // Assign users through the join table explicitly.
        const savedTasks = await taskRepository.find();
        for (let index = 0; index < savedTasks.length; index += 1) {
            const userIds = taskData[index]?.userIds ?? [demoUser.id];
            const users = await userRepository.findBy({
                id: In(userIds.length ? userIds : [demoUser.id]),
            });
            savedTasks[index].users = users;
        }
        await taskRepository.save(savedTasks);

        // ------------------------------------------------------------------
        // Events
        // ------------------------------------------------------------------
        const eventRepository = dataSource.getRepository(Event);

        const eventData = [
            {
                title: 'Discovery call — Vandelay',
                description:
                    'Understand requirements for the platform rollout.',
                color: '#1677FF',
                startDate: daysFromNow(1, 10),
                endDate: daysFromNow(1, 11),
                categoryId: categories[1].id,
                userIds: [demoUser.id, salesTeam[0].id],
            },
            {
                title: 'Quarterly business review',
                description: 'Review pipeline health and revenue targets.',
                color: '#722ED1',
                startDate: daysFromNow(3, 9),
                endDate: daysFromNow(3, 12),
                categoryId: categories[0].id,
                userIds: [demoUser.id, salesTeam[1].id, salesTeam[2].id],
            },
            {
                title: 'Product demo — Hooli',
                description: 'Walk through the analytics module.',
                color: '#52C41A',
                startDate: daysFromNow(4, 14),
                endDate: daysFromNow(4, 15),
                categoryId: categories[3].id,
                userIds: [salesTeam[1].id],
            },
            {
                title: 'Contract follow-up — Acme',
                color: '#FA541C',
                startDate: daysFromNow(2, 15),
                endDate: daysFromNow(2, 16),
                categoryId: categories[2].id,
                userIds: [salesTeam[3].id],
            },
            {
                title: 'Site visit — Umbrella Corp',
                description: 'On-site workshop for the migration team.',
                color: '#13C2C2',
                startDate: daysFromNow(8, 9),
                endDate: daysFromNow(8, 17),
                categoryId: categories[4].id,
                userIds: [salesTeam[2].id, demoUser.id],
            },
            {
                title: 'Board update prep',
                color: '#EB2F96',
                startDate: daysFromNow(6, 11),
                endDate: daysFromNow(6, 13),
                categoryId: categories[0].id,
                userIds: [demoUser.id],
            },
        ];

        for (const { userIds, ...data } of eventData) {
            const event = eventRepository.create({
                ...data,
                createdByUserId: demoUser.id,
            });
            const saved = await eventRepository.save(event);
            const participants = await userRepository.findBy({
                id: In(userIds.length ? userIds : [demoUser.id]),
            });
            saved.participants = participants;
            await eventRepository.save(saved);
        }

        // ------------------------------------------------------------------
        // Summary
        // ------------------------------------------------------------------
        const counts = {
            users: await userRepository.count(),
            companies: await companyRepository.count(),
            contacts: await contactRepository.count(),
            deals: await dealRepository.count(),
            tasks: await taskRepository.count(),
            events: await eventRepository.count(),
            audits: await dataSource.getRepository(Audit).count(),
        };

        console.log('Seed completed:');
        console.table(counts);
        console.log('Demo login:');
        console.log(`  email:    ${DEMO_EMAIL}`);
        console.log(`  password: ${DEMO_PASSWORD}`);
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
