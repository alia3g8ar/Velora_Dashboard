import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
    DataSource,
    EntitySubscriberInterface,
    InsertEvent,
    UpdateEvent,
} from 'typeorm';
import { getRequestContext } from '../../../common/context/request-context';
import { Audit, AuditChange } from '../entities/audit.entity';
import { Deal } from '../entities/deal.entity';
import { User } from '../entities/user.entity';

type AuditedDealField =
    | 'title'
    | 'value'
    | 'stageId'
    | 'companyId'
    | 'dealOwnerId'
    | 'notes';

const AUDITED_FIELDS: AuditedDealField[] = [
    'title',
    'value',
    'stageId',
    'companyId',
    'dealOwnerId',
    'notes',
];

/**
 * Records real audit entries for Deal creates and updates. The dashboard's
 * "Latest activities" feed reads these records; nothing is faked.
 *
 * The acting user is read from the per-request async context, which is
 * populated by UserContextMiddleware from the JWT. Records are written inside
 * the same transaction as the deal change itself.
 */
@Injectable()
export class AuditSubscriber implements EntitySubscriberInterface<Deal> {
    constructor(@InjectDataSource() readonly dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo(): typeof Deal {
        return Deal;
    }

    async afterInsert(event: InsertEvent<Deal>): Promise<void> {
        await this.record(event, 'CREATE', event.entity, []);
    }

    async afterUpdate(event: UpdateEvent<Deal>): Promise<void> {
        const entity = event.entity as Deal;
        const databaseEntity = event.databaseEntity as Deal | undefined;
        const changes = this.computeChanges(entity, databaseEntity);
        if (changes.length === 0) {
            return;
        }
        await this.record(event, 'UPDATE', entity, changes);
    }

    private computeChanges(entity: Deal, databaseEntity?: Deal): AuditChange[] {
        const changes: AuditChange[] = [];

        for (const field of AUDITED_FIELDS) {
            const from = databaseEntity?.[field] ?? null;
            const to = entity[field] ?? null;

            if (JSON.stringify(from) === JSON.stringify(to)) {
                continue;
            }

            changes.push({
                field: field as string,
                from: from === null ? null : String(from),
                to: to === null ? null : String(to),
            });
        }

        return changes;
    }

    private async record(
        event: InsertEvent<Deal> | UpdateEvent<Deal>,
        action: string,
        deal: Deal,
        changes: AuditChange[],
    ): Promise<void> {
        const { userId } = getRequestContext();

        const audit = event.manager.create(Audit, {
            action,
            targetEntity: 'Deal',
            targetId: deal.id,
            changes,
            userId: userId ?? null,
        });

        if (userId) {
            audit.user = { id: userId } as User;
        }

        await event.manager.save(audit);
    }
}
