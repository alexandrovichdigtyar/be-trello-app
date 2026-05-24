import { ROLE_DELIMITER, type IdentityClaims } from '@trello-app/shared';
import type { Session, User } from 'better-auth/types';
import type { PrismaClient } from '../generated/prisma/client';

export type DefineJwtPayloadInput = {
  user: User;
  session: Session & { activeOrganizationId?: string | null };
};

export function createDefineJwtPayload(
  prisma: PrismaClient,
  permsForRoles: (roleNames: string[]) => string[],
) {
  return async function defineJwtPayload({
    user,
    session,
  }: DefineJwtPayloadInput): Promise<IdentityClaims> {
    const activeOrganizationId = session.activeOrganizationId ?? null;

    const payload: IdentityClaims = {
      userId: user.id,
      orgId: activeOrganizationId,
      perms: [],
    };

    if (!activeOrganizationId) {
      return payload;
    }

    const member = await prisma.member.findFirst({
      where: {
        userId: user.id,
        organizationId: activeOrganizationId,
      },
      select: { role: true },
    });

    if (member?.role) {
      const roleNames = member.role
        .split(ROLE_DELIMITER)
        .map((r) => r.trim())
        .filter(Boolean);
      payload.perms = permsForRoles(roleNames);
    }

    return payload;
  };
}
