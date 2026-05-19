import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins/organization';
import { createAccessControl } from 'better-auth/plugins/access';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { jwt } from 'better-auth/plugins';
import { getAuthBaseUrl } from '../config/api';
import { createDefineJwtPayload } from './define-jwt-payload';
import type { DefinePayloadInput } from '@trello-app/shared';

const statement = {
  project: ['create', 'share', 'update', 'delete'],
  sale: ['create', 'read', 'update', 'delete'],
  organization: ['update', 'delete'],
} as const;

const ac = createAccessControl(statement);

const editor = ac.newRole({
  project: ['create', 'update'],
});

const admin = ac.newRole({
  project: ['create', 'update', 'delete'],
  organization: ['update'],
});

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

export const trustedOrigins = process.env.TRUSTED_ORIGINS?.split(',')
  .map((o) => o.trim())
  .filter(Boolean) ?? ['http://localhost:4002'];

export const roles = { editor, admin };
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

const defineJwtPayload = createDefineJwtPayload(prisma, permsForRoles);

export const auth = betterAuth({
  baseURL: getAuthBaseUrl(),
  trustedOrigins,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: false,
    maxPasswordLength: 100,
    minPasswordLength: 8,
  },
  plugins: [
    organization({
      ac,
      roles: {
        editor,
        admin,
      },
    }),
    jwt({
        jwt: {
          definePayload: defineJwtPayload,
        },
      }),
  ],
});
