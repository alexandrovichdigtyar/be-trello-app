import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins/organization';
import { createAccessControl } from 'better-auth/plugins/access';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { jwt } from 'better-auth/plugins';
import { getAuthBaseUrl } from '../config/api';
import { createDefineJwtPayload } from './define-jwt-payload';
import { TeamEvents } from '../events/team-events';
import { TeamMemberEvents } from '../events/team-members-event';

const statement = {
  project: ['create', 'share', 'update', 'delete'],
  sale: ['create', 'read', 'update', 'delete'],
  organization: ['update', 'delete'],
  team: ['create', 'update', 'delete'],
  member: ['create', 'update', 'delete'],
} as const;

const ac = createAccessControl(statement);

const editor = ac.newRole({
  project: ['create', 'update'],
});

const admin = ac.newRole({
  project: ['create', 'update', 'delete'],
  organization: ['update'],
  team: ['create', 'update', 'delete'],
});

const owner = ac.newRole({
  project: ['create', 'share', 'update', 'delete'],
  sale: ['create', 'read', 'update', 'delete'],
  organization: ['update', 'delete'],
  team: ['create', 'update', 'delete'],
  member: ['create', 'update', 'delete'],
});

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

export const trustedOrigins = process.env.TRUSTED_ORIGINS?.split(',')
  .map((o) => o.trim())
  .filter(Boolean) ?? ['http://localhost:4002'];

export const roles = { editor, admin, owner };
export type RoleName = keyof typeof roles;

function isConfiguredRole(name: string): name is RoleName {
  return Object.hasOwn(roles, name);
}

export function permsForRoles(roleNames: string[]): string[] {
  const seen = new Set<string>();

  for (const roleName of roleNames) {
    if (!isConfiguredRole(roleName)) continue;

    const statements = roles[roleName].statements;
    for (const resource of Object.keys(statements)) {
      const key = resource as keyof typeof statements;
      const actions = statements[key];
      if (!actions) continue;
      for (const action of actions) {
        seen.add(`${String(key)}:${action}`);
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
        owner,
      },
      organizationHooks: {
        afterCreateTeam: async ({ team }) => {
          await TeamEvents.created(team);
        },
        afterDeleteTeam: async ({ team }) => {
          await TeamEvents.deleted(team);
        },
        afterUpdateTeam: async ({ team }) => {
          await TeamEvents.updated(team!);
        },
        afterAddTeamMember: async ({ team, teamMember }) => {
          await TeamMemberEvents.added(team, teamMember);
        },
        afterRemoveTeamMember: async ({ team, teamMember }) => {
          await TeamMemberEvents.removed(team, teamMember);
        },
      },
      teams: {
        enabled: true,
        defaultTeam: {
          enabled: true,
        },
        
      }
    }),
    jwt({
        jwt: {
          definePayload: defineJwtPayload,
        },
      }),
  ],
});
