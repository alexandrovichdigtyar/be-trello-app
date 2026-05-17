import type { Session, User } from "better-auth";
import {
  ROLE_DELIMITER,
  type IdentityClaims,
} from "@trello-app/shared";
import { permsForRoles } from "./permissions";
import { prisma } from "./prisma";

type DefinePayloadInput = {
  user: User & Record<string, unknown>;
  session: Session & Record<string, unknown>;
};

export async function defineJwtPayload({
  user,
  session,
}: DefinePayloadInput): Promise<IdentityClaims> {
  const activeOrganizationId =
    typeof session.activeOrganizationId === "string"
      ? session.activeOrganizationId
      : null;

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
  });

  if (member?.role) {
    payload.perms = permsForRoles(member.role.split(ROLE_DELIMITER));
  }

  return payload;
}
