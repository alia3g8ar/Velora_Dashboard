import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import type { DataSource } from 'typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedRequest } from '../../common/guard/jwt-auth.guard';
import { User } from '../crm/entities/user.entity';
import { Role } from '../crm/enums';
import { AdminDeleteUserInput, AdminUpdateUserRoleInput } from './admin.inputs';

/**
 * ADMIN-only user management endpoints backing the "Admin panel" page.
 *
 * Every resolver first verifies the acting user's JWT role is ADMIN (the
 * JwtAuthGuard already guarantees an authenticated request). Regular users
 * keep the normal scoped CRUD; this panel is the only place where the full
 * user list is exposed.
 */
@Resolver(() => User)
export class AdminResolver {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    @Query(() => [User])
    async adminUsers(
        @Context() context: { req: AuthenticatedRequest },
    ): Promise<User[]> {
        this.assertAdmin(context);
        return this.userRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    @Mutation(() => User)
    async adminUpdateUserRole(
        @Args('input') input: AdminUpdateUserRoleInput,
        @Context() context: { req: AuthenticatedRequest },
    ): Promise<User> {
        this.assertAdmin(context);

        const user = await this.userRepository.findOneBy({
            id: Number(input.id),
        });
        if (!user) {
            throw new NotFoundException(
                `Unable to find User with id: ${input.id}`,
            );
        }

        // Never remove the last admin — the app must always keep at least one
        // account that can manage the others.
        if (user.role === Role.ADMIN && input.role !== Role.ADMIN) {
            await this.ensureNotLastAdmin();
        }

        user.role = input.role;
        return this.userRepository.save(user);
    }

    @Mutation(() => User)
    async adminDeleteUser(
        @Args('input') input: AdminDeleteUserInput,
        @Context() context: { req: AuthenticatedRequest },
    ): Promise<User> {
        this.assertAdmin(context);

        const adminId = Number(context.req.user?.sub);
        const user = await this.userRepository.findOneBy({
            id: Number(input.id),
        });
        if (!user) {
            throw new NotFoundException(
                `Unable to find User with id: ${input.id}`,
            );
        }
        if (user.id === adminId) {
            throw new ForbiddenException('You cannot delete your own account');
        }
        if (user.role === Role.ADMIN) {
            await this.ensureNotLastAdmin();
        }

        // Hand the user's data over to the acting admin instead of deleting
        // it: the schema's NOT NULL + CASCADE references would otherwise
        // destroy rows belonging to OTHER users (e.g. their deals on this
        // user's companies). Nothing is lost — the account is gone and its
        // records remain, owned by the admin, for re-assignment later.
        const removedId = user.id;
        await this.reassignOwnedData(adminId, removedId);

        // `remove()` clears the primary key on the returned entity, so
        // restore it before returning (the panel needs the id to refresh).
        const removed = await this.userRepository.remove(user);
        removed.id = removedId;
        console.log(
            `[admin] user ${removedId} (${user.email}) deleted; data reassigned to admin ${adminId}`,
        );
        return removed;
    }

    private assertAdmin(context: { req: AuthenticatedRequest }): void {
        if (context.req.user?.role !== Role.ADMIN) {
            throw new ForbiddenException(
                'Admin role is required for this operation',
            );
        }
    }

    private async ensureNotLastAdmin(): Promise<void> {
        const adminCount = await this.userRepository.countBy({
            role: Role.ADMIN,
        });
        if (adminCount <= 1) {
            throw new ForbiddenException(
                'Cannot remove the last administrator',
            );
        }
    }

    private async reassignOwnedData(
        adminId: number,
        userId: number,
    ): Promise<void> {
        // Owner columns on the main data tables.
        const ownerTables: Array<[string, string]> = [
            ['companies', 'sales_owner_id'],
            ['contacts', 'sales_owner_id'],
            ['deals', 'deal_owner_id'],
            ['tasks', 'created_by_id'],
            ['events', 'created_by_id'],
        ];
        for (const [table, column] of ownerTables) {
            await this.dataSource.query(
                `UPDATE \`${table}\` SET \`${column}\` = ? WHERE \`${column}\` = ?`,
                [adminId, userId],
            );
        }

        // Many-to-many join tables: drop rows that would collide with the
        // admin's existing assignment for the same parent, then re-point.
        await this.mergeJoinTableToUser(
            'task_users',
            'task_id',
            adminId,
            userId,
        );
        await this.mergeJoinTableToUser(
            'event_participants',
            'event_id',
            adminId,
            userId,
        );

        // Audits keep their history; the user_id FK is ON DELETE SET NULL.
    }

    private async mergeJoinTableToUser(
        table: string,
        fkColumn: string,
        adminId: number,
        userId: number,
    ): Promise<void> {
        await this.dataSource.query(
            `DELETE FROM \`${table}\`
            WHERE \`user_id\` = ?
              AND \`${fkColumn}\` IN (
                  SELECT \`${fkColumn}\` FROM (
                      SELECT DISTINCT \`${fkColumn}\`
                      FROM \`${table}\`
                      WHERE \`user_id\` = ?
                  ) AS existing_admin_rows
              )`,
            [adminId, userId],
        );
        await this.dataSource.query(
            `UPDATE \`${table}\` SET \`user_id\` = ? WHERE \`user_id\` = ?`,
            [adminId, userId],
        );
    }
}
