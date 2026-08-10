import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { DatabaseConfig } from '../../config/database.config';
import { UserContextMiddleware } from '../../common/middleware/user-context.middleware';
import { AuthModule } from '../auth/auth.module';
import { CrmModule } from '../crm/crm.module';

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
                autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
                sortSchema: true,
                playground: true,
                introspection: true,
                // The frontend sends the Apollo preflight header, but we keep
                // CSRF prevention off so any GraphQL client can talk to the API.
                csrfPrevention: false,
            }),
        }),
        AuthModule,
        CrmModule,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        // Populates the per-request async context used for audit attribution.
        consumer.apply(UserContextMiddleware).forRoutes('*');
    }
}
