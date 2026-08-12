import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { accessSync, constants } from 'fs';
import { join } from 'path';
import { DatabaseConfig } from '../../config/database.config';
import { UserContextMiddleware } from '../../common/middleware/user-context.middleware';
import { MutationRateLimitGuard } from '../../common/guard/mutation-rate-limit.guard';
import { DemoResetService } from '../../common/services/demo-reset.service';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { CrmModule } from '../crm/crm.module';
import { UploadsModule } from '../uploads/uploads.module';

function isFilesystemWritable(): boolean {
    try {
        accessSync(process.cwd(), constants.W_OK);
        return true;
    } catch {
        return false;
    }
}

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useClass: DatabaseConfig,
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
            driver: ApolloDriver,
            useFactory: () => ({
                // Serverless platforms (e.g. Vercel) run on a read-only
                // filesystem, so the schema is generated in memory there.
                // Locally it is written to src/schema.gql, which feeds GraphQL
                // Codegen. Deciding by writability (rather than NODE_ENV) keeps
                // the app safe even if NODE_ENV is misconfigured.
                autoSchemaFile: isFilesystemWritable()
                    ? join(process.cwd(), 'src/schema.gql')
                    : true,
                sortSchema: true,
                playground: true,
                introspection: true,
                // The frontend sends the Apollo preflight header, but we keep
                // CSRF prevention off so any GraphQL client can talk to the API.
                csrfPrevention: false,
                // Auth resolvers set HttpOnly cookies via context.res; NestJS
                // only injects req by default.
                context: ({ req, res }) => ({ req, res }),
            }),
        }),
        AuthModule,
        CrmModule,
        AdminModule,
        UploadsModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: MutationRateLimitGuard,
        },
        DemoResetService,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        // Populates the per-request async context used for audit attribution.
        consumer.apply(UserContextMiddleware).forRoutes('*');
    }
}
