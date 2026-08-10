import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

type DatabaseSslOptions = {
    ca: string;
    rejectUnauthorized: true;
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
            ...(sslOptions ? { ssl: sslOptions } : {}),
        };
    }

    private createSslOptions(): DatabaseSslOptions | undefined {
        if (process.env.DB_SSL_ENABLED !== 'true') {
            return undefined;
        }

        const encodedCertificate = process.env.DB_SSL_CA_BASE64?.trim();

        if (!encodedCertificate) {
            throw new Error(
                'DB_SSL_CA_BASE64 is required when DB_SSL_ENABLED=true.',
            );
        }

        const normalizedCertificate = encodedCertificate.replace(/\s/g, '');

        if (
            normalizedCertificate.length % 4 !== 0 ||
            !/^[A-Za-z0-9+/]*={0,2}$/.test(normalizedCertificate)
        ) {
            throw new Error(
                'DB_SSL_CA_BASE64 must contain a valid Base64 value.',
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
                'DB_SSL_CA_BASE64 must decode to a valid PEM certificate.',
            );
        }

        return {
            ca: certificate,
            rejectUnauthorized: true,
        };
    }
}
