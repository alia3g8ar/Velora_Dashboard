import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SQLComparisonBuilder } from '@ptc-org/nestjs-query-typeorm/src/query/sql-comparison.builder';
import { AppModule } from './modules/app/app.module';

// The Refine data provider maps its `contains` operator to `iLike`. nestjs-query
// emits Postgres-only `ILIKE` for that comparison, which MySQL rejects. MySQL's
// `LIKE` is already case-insensitive for the default collations, so remapping
// `iLike`/`notILike` to `LIKE`/`NOT LIKE` is semantically correct here.
SQLComparisonBuilder.DEFAULT_COMPARISON_MAP.ilike = 'LIKE';
SQLComparisonBuilder.DEFAULT_COMPARISON_MAP.notilike = 'NOT LIKE';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    let allowedOrigin: string;

    try {
        const parsedFrontendUrl = new URL(rawFrontendUrl.trim());

        if (!['http:', 'https:'].includes(parsedFrontendUrl.protocol)) {
            throw new Error('Unsupported protocol');
        }

        allowedOrigin = parsedFrontendUrl.origin;
    } catch {
        throw new Error(
            'FRONTEND_URL must be a valid HTTP(S) URL without extra text',
        );
    }

    const allowedOrigins = new Set([
        allowedOrigin,
        // Keep local development working even when FRONTEND_URL points at a
        // production origin.
        'http://localhost:5173',
    ]);

    app.enableCors({
        origin: (origin, callback) => {
            // Same-origin requests (no Origin header — how the browser talks to
            // the API on Vercel, where both apps share one domain) and the
            // configured frontend origin(s) are allowed. Any other origin is
            // served without CORS headers rather than being blocked.
            if (!origin || allowedOrigins.has(origin)) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'apollo-require-preflight',
        ],
        exposedHeaders: ['Content-Length', 'Content-Type'],
    });

    // Validates resolver input types. Whitelisting is intentionally disabled:
    // the nestjs-query generated input types carry their own validators, and
    // GraphQL already type-checks incoming arguments.
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );
    app.enableShutdownHooks();

    // On cloud platforms the platform injects PORT and must be respected in
    // production. Locally we default to 3001. An explicit BACKEND_PORT wins.
    const port =
        process.env.BACKEND_PORT ??
        (process.env.NODE_ENV === 'production' ? process.env.PORT : 3001) ??
        3001;

    await app.listen(port);
    Logger.log(`Velora CRM API is running on http://localhost:${port}/graphql`);
}

void bootstrap();
