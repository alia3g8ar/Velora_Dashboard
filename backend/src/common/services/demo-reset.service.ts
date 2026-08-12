import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { seedDemoData } from '../../scripts/seed-data';

/**
 * Demo auto-reset job.
 *
 * Reseeds the CRM database every `DEMO_RESET_INTERVAL_MS` (default 1 hour) so
 * a demo environment never accumulates junk — no matter how many records a
 * visitor creates, the data is wiped back to the clean demo set each hour.
 * The trigger itself lives in process memory (a `setInterval`), which matches
 * the demo runtime where data would be lost on restart anyway.
 *
 * The demo login survives the reset: the reseed recreates the demo account
 * with the same credentials. Disable with `DEMO_AUTO_RESET=false`.
 */
@Injectable()
export class DemoResetService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DemoResetService.name);
    private timer?: NodeJS.Timeout;
    private running = false;

    constructor(
        private readonly dataSource: DataSource,
        private readonly config: ConfigService,
    ) {}

    onModuleInit(): void {
        const enabled =
            this.config.get<string>('DEMO_AUTO_RESET', 'true') !== 'false';
        const intervalMs = Number(
            this.config.get<string>('DEMO_RESET_INTERVAL_MS', '3600000'),
        );

        if (!enabled) {
            this.logger.log('Demo auto-reset is disabled.');
            return;
        }

        this.timer = setInterval(
            () => void this.reset(),
            Math.max(60000, intervalMs),
        );
        this.logger.log(
            `Demo auto-reset scheduled every ${Math.round(intervalMs / 60000)} minute(s).`,
        );
    }

    onModuleDestroy(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }

    private async reset(): Promise<void> {
        if (this.running) {
            return;
        }

        this.running = true;

        try {
            const summary = await seedDemoData(this.dataSource);
            this.logger.log(
                `Demo reset completed: ${summary.counts.deals} deals, ` +
                    `${summary.counts.companies} companies, ` +
                    `${summary.counts.contacts} contacts, ${summary.counts.tasks} tasks.`,
            );
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            this.logger.error(`Demo reset failed: ${message}`);
        } finally {
            this.running = false;
        }
    }
}
