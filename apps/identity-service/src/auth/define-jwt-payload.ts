import { ROLE_DELIMITER, type DefinePayloadInput, type IdentityClaims } from '@trello-app/shared';
import type { PrismaClient } from '../generated/prisma/client';

async function resolveActiveOrganizationId(
  prisma: PrismaClient,
  userId: string,
  session: DefinePayloadInput['session'],
): Promise<string | null> {
  const fromDb =
    (await prisma.session.findFirst({
      where: {
        userId,
        activeOrganizationId: { not: null },
      },
      orderBy: { updatedAt: 'desc' },
      select: { activeOrganizationId: true },
    })) ??
    (await prisma.session.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { activeOrganizationId: true },
    }));

  const raw = fromDb?.activeOrganizationId ?? session.activeOrganizationId;
  return typeof raw === 'string' && raw.length > 0 ? raw : null;
}

export function createDefineJwtPayload(
  prisma: PrismaClient,
  permsForRoles: (roleNames: string[]) => string[],
) {
  return async function defineJwtPayload({
    user,
    session,
  }: DefinePayloadInput): Promise<IdentityClaims> {
    const activeOrganizationId = await resolveActiveOrganizationId(prisma, user.id, session);

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
