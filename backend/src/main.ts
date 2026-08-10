import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SQLComparisonBuilder } from '@ptc-org/nestjs-query-typeorm/src/query/sql-comparison.builder';
import express from 'express';

// The Refine data provider maps its `contains` operator to `iLike`. nestjs-query
// emits Postgres-only `ILIKE` for that comparison, which MySQL rejects. MySQL's
// `LIKE` is already case-insensitive for the default collations, so remapping
// `iLike`/`notILike` to `LIKE`/`NOT LIKE` is semantically correct here.
SQLComparisonBuilder.DEFAULT_COMPARISON_MAP.ilike = 'LIKE';
SQLComparisonBuilder.DEFAULT_COMPARISON_MAP.notilike = 'NOT LIKE';

async function bootstrap(): Promise<void> {
    // On cloud platforms the platform injects PORT and must be respected in
    // production. Locally we default to 3001. An explicit BACKEND_PORT wins.
    const port =
        process.env.BACKEND_PORT ??
        (process.env.NODE_ENV === 'production' ? process.env.PORT : 3001) ??
        3001;

    let app: NestExpressApplication;

    try {
        // Dynamic import keeps module-load-time failures (e.g. a native module
        // that cannot be loaded on the platform) inside the error handling
        // below, so they are surfaced instead of crashing the function.
        // nodenext resolution requires the explicit extension on dynamic
        // import specifiers.
        const { AppModule } = await import('./modules/app/app.module.js');

        // abortOnError: false — without it NestFactory exits the process on a
        // boot failure, which on serverless platforms (Vercel) surfaces as an
        // opaque FUNCTION_INVOCATION_FAILED with no detail.
        app = await NestFactory.create<NestExpressApplication>(AppModule, {
            abortOnError: false,
        });
    } catch (error) {
        // Log the real error and answer every request with it so the cause is
        // visible in the function logs and the HTTP body.
        const detail =
            error instanceof Error
                ? (error.stack ?? error.message)
                : String(error);
        Logger.error(`Velora CRM failed to start: ${detail}`);

        const fallback = express();
        // Middleware without a path pattern (express 5's path-to-regexp rejects
        // the legacy '*' route) — matches every request.
        fallback.use((_req, res) => {
            res.status(500).json({
                error: 'Velora CRM backend failed to start',
                detail,
            });
        });
        // express listen() returns the http.Server, not a Promise — keep the
        // fallback non-blocking.
        fallback.listen(port);
        return;
    }

    const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    let allowedOrigin: string;

    try {
        const parsedFrontendUrl = new URL(rawFrontendUrl.trim());

        if (!['http:', 'https:'].includes(parsedFrontendUrl.protocol)) {
            throw new Error('Unsupported protocol');
        }

        allowedOrigin = parsedFrontendUrl.origin;
    } catch {
        // A misconfigured FRONTEND_URL must never take the API down. Log the
        // problem and fall back to the local dev origin; same-origin requests
        // on Vercel (no Origin header) are allowed regardless.
        Logger.warn(
            `Ignoring invalid FRONTEND_URL "${rawFrontendUrl}" — it must be a valid HTTP(S) URL. ` +
                'Falling back to http://localhost:5173 for cross-origin CORS.',
        );
        allowedOrigin = 'http://localhost:5173';
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

    await app.listen(port);
    Logger.log(`Velora CRM API is running on http://localhost:${port}/graphql`);
}

void bootstrap();
