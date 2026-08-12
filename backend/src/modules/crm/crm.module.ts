import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import {
    scopedQueryServiceProvider,
    scopedRules,
} from './services/scoped-query.service';
import { AuditSubscriber } from './subscribers/audit.subscriber';
import { DealSubscriber } from './subscribers/deal.subscriber';
import { Audit } from './entities/audit.entity';
import { Company } from './entities/company.entity';
import { Contact } from './entities/contact.entity';
import { DealStage } from './entities/deal-stage.entity';
import { Deal } from './entities/deal.entity';
import { EventCategory } from './entities/event-category.entity';
import { Event } from './entities/event.entity';
import { TaskStage } from './entities/task-stage.entity';
import { Task } from './entities/task.entity';
import { User } from './entities/user.entity';
import { AuditResolver } from './resolvers/audit.resolver';
import { CompanyResolver } from './resolvers/company.resolver';
import { ContactResolver } from './resolvers/contact.resolver';
import { DealStageResolver } from './resolvers/deal-stage.resolver';
import { DealResolver } from './resolvers/deal.resolver';
import { EventCategoryResolver } from './resolvers/event-category.resolver';
import { EventResolver } from './resolvers/event.resolver';
import { TaskStageResolver } from './resolvers/task-stage.resolver';
import { TaskResolver } from './resolvers/task.resolver';
import { UserResolver } from './resolvers/user.resolver';

const entities = [
    Audit,
    Company,
    Contact,
    Deal,
    DealStage,
    Event,
    EventCategory,
    Task,
    TaskStage,
    User,
];

@Module({
    imports: [
        TypeOrmModule.forFeature(entities),
        NestjsQueryTypeOrmModule.forFeature(entities),
        // Registers the default (allow-all) authorizer provider for each DTO,
        // which the CRUD resolvers' AuthorizerInterceptor requires.
        NestjsQueryGraphQLModule.forFeature({
            dtos: entities.map((DTOClass) => ({ DTOClass })),
        }),
    ],
    providers: [
        CompanyResolver,
        ContactResolver,
        DealResolver,
        DealStageResolver,
        EventResolver,
        EventCategoryResolver,
        TaskResolver,
        TaskStageResolver,
        UserResolver,
        AuditResolver,
        DealSubscriber,
        AuditSubscriber,
        // Per-user data isolation: the scoped providers override the plain
        // QueryService tokens, so every read and mutation is scoped to the
        // acting user (race-free; the hook mechanism the library provides is
        // broken for multi-field operations).
        scopedQueryServiceProvider(Company, scopedRules.Company),
        scopedQueryServiceProvider(Contact, scopedRules.Contact),
        scopedQueryServiceProvider(Deal, scopedRules.Deal),
        scopedQueryServiceProvider(Task, scopedRules.Task),
        scopedQueryServiceProvider(Event, scopedRules.Event),
        scopedQueryServiceProvider(Audit, scopedRules.Audit),
        scopedQueryServiceProvider(User, scopedRules.User),
    ],
})
export class CrmModule {}
