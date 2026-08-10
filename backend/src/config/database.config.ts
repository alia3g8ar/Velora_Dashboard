import { Logger } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

type DatabaseSslOptions = {
    ca?: string;
    rejectUnauthorized: boolean;
};

export class DatabaseConfig implements TypeOrmOptionsFactory {
    createTypeOrmOptions(): TypeOrmModuleOptions {
        const isProduction = process.env.NODE_ENV === 'production';
        const sslOptions = this.createSslOptions();

        return {
            type: process.env.TYPE_DB as 'mysql',
            host: process.env.HOST_DB,
            port: Number(process.env.PORT_DB),
            username: process.env.USERNAME_DB,
            password: process.env.PASSWORD_DB,
            database: process.env.DATABASE_DB,
            autoLoadEntities: process.env.AUTOLOADENTITIES === 'true',
            synchronize: !isProduction && process.env.SYNCHRONIZE === 'true',
            migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
            migrationsTableName: 'migrations',
            migrationsRun: false,
            // On serverless platforms (Vercel) a long connection retry loop
            // would exceed the function duration and fail invisibly. Fail fast
            // so the bootstrap error handler can surface the real error.
            ...(isProduction ? { retryAttempts: 2, retryDelay: 1000 } : {}),
            ...(sslOptions ? { ssl: sslOptions } : {}),
        };
    }

    private createSslOptions(): DatabaseSslOptions | undefined {
        if (process.env.DB_SSL_ENABLED !== 'true') {
            return undefined;
        }

        const encodedCertificate = process.env.DB_SSL_CA_BASE64?.trim();

        if (!encodedCertificate) {
            // No CA certificate provided. Managed providers like Aiven require
            // TLS but use their own CA, which is not in the system trust store
            // — without it the handshake would fail outright. Encrypt the
            // connection with certificate verification disabled so the app
            // works out of the box. Production deployments should set
            // DB_SSL_CA_BASE64 for real verification.
            Logger.warn(
                'DB_SSL_ENABLED=true but DB_SSL_CA_BASE64 is not set — ' +
                    'connecting with TLS encryption and certificate ' +
                    'verification disabled. Set DB_SSL_CA_BASE64 to the ' +
                    'Base64 encoding of your CA certificate to enable ' +
                    'verification.',
            );
            return { rejectUnauthorized: false };
        }

        const normalizedCertificate = encodedCertificate.replace(/\s/g, '');

        if (
            normalizedCertificate.length % 4 !== 0 ||
            !/^[A-Za-z0-9+/]*={0,2}$/.test(normalizedCertificate)
        ) {
            throw new Error(
                'DB_SSL_CA_BASE64 must be a valid Base64 string. Encode your ' +
                    'certificate file with: base64 -w0 ca.pem (no line breaks, ' +
                    'no PEM headers).',
            );
        }

        const certificate = Buffer.from(normalizedCertificate, 'base64')
            .toString('utf8')
            .trim();

        if (
            !certificate.includes('-----BEGIN CERTIFICATE-----') ||
            !certificate.includes('-----END CERTIFICATE-----')
        ) {
            throw new Error(
                'DB_SSL_CA_BASE64 must decode to a valid PEM certificate. ' +
                    'Encode your certificate file with: base64 -w0 ca.pem',
            );
        }

        return {
            ca: certificate,
            rejectUnauthorized: true,
        };
    }
}
