import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements,
  board: ["create", "read", "update", "delete"],
  list: ["create", "read", "update", "delete"],
  card: ["create", "read", "update", "delete"],
  comment: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
  ...ownerAc.statements,
  board: ["create", "read", "update", "delete"],
  list: ["create", "read", "update", "delete"],
  card: ["create", "read", "update", "delete"],
  comment: ["create", "read", "update", "delete"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  board: ["create", "read", "update", "delete"],
  list: ["create", "read", "update", "delete"],
  card: ["create", "read", "update", "delete"],
  comment: ["create", "read", "update", "delete"],
});

export const member = ac.newRole({
  ...memberAc.statements,
  board: ["read"],
  list: ["create", "read", "update"],
  card: ["create", "read", "update"],
  comment: ["create", "read", "update"],
});

export const roles = { owner, admin, member };
export type RoleName = keyof typeof roles;

export function permsForRoles(roleNames: string[]): string[] {
  const seen = new Set<string>();
  for (const roleName of roleNames) {
    const role = roles[roleName as RoleName];
    if (!role) continue;
    for (const [resource, actions] of Object.entries(role.statements)) {
      for (const action of actions as readonly string[]) {
        seen.add(`${resource}:${action}`);
      }
    }
  }
  return Array.from(seen);
}
