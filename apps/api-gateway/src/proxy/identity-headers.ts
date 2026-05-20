export const IdentityHeader = {
  Authorization: 'authorization',
  UserId: 'x-user-id',
  OrgId: 'x-org-id',
  Perms: 'x-perms',
} as const;

export type IdentityHeaderName =
  (typeof IdentityHeader)[keyof typeof IdentityHeader];

export const IDENTITY_HEADERS = Object.values(
  IdentityHeader,
) as readonly IdentityHeaderName[];
