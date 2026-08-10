import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
    DataSource,
    EntitySubscriberInterface,
    InsertEvent,
    UpdateEvent,
} from 'typeorm';
import { Deal } from '../entities/deal.entity';

/**
 * Keeps the aggregate-only closeDateDay/Month/Year columns in sync with the
 * deal's closeDate. The dashboard chart groups deals by these fields.
 */
@Injectable()
export class DealSubscriber implements EntitySubscriberInterface<Deal> {
    constructor(@InjectDataSource() readonly dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo(): typeof Deal {
        return Deal;
    }

    beforeInsert(event: InsertEvent<Deal>): void {
        this.applyCloseDateParts(event.entity);
    }

    beforeUpdate(event: UpdateEvent<Deal>): void {
        if (event.entity) {
            this.applyCloseDateParts(event.entity as Deal);
        }
    }

    private applyCloseDateParts(deal: Deal): void {
        if (!('closeDate' in deal)) {
            return;
        }

        if (deal.closeDate) {
            const date = new Date(deal.closeDate);
            deal.closeDateDay = date.getDate();
            deal.closeDateMonth = date.getMonth() + 1;
            deal.closeDateYear = date.getFullYear();
        } else {
            deal.closeDateDay = undefined;
            deal.closeDateMonth = undefined;
            deal.closeDateYear = undefined;
        }
    }
}
