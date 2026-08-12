import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';

async function bootstrap(): Promise<void> {
    // BACKEND_PORT is the local override (backend/.env sets 3001); on cloud
    // platforms (Vercel) the platform injects PORT. Default matches the
    // frontend's local API default.
    const port = process.env.BACKEND_PORT ?? process.env.PORT ?? 3001;

    let app: NestExpressApplication;

    try {
        // MySQL compatibility patch (ILIKE -> LIKE). Imported dynamically so
        // nothing from the application/package graph can throw before this
        // error handler is active — the deep import it uses has no public
        // export, so keep it out of top-level module evaluation.
        await import('./common/sql-comparison.patch.js');

        // Dynamic import keeps module-load-time failures inside this handler.
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

    // Trust the proxy chain so `request.ip` reflects the real client IP from
    // `x-forwarded-for` (Vercel). Without this every request looks like it
    // comes from the edge proxy, which would turn the mutation rate limiter
    // into a global lock shared by all visitors.
    app.set('trust proxy', true);

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
