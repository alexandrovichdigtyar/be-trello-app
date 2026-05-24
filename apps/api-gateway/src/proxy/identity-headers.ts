export const IdentityHeader = {
  UserId: 'x-user-id',
  OrgId: 'x-org-id',
  Perms: 'x-perms',
} as const;

export type IdentityHeaderName =
  (typeof IdentityHeader)[keyof typeof IdentityHeader];

export const IDENTITY_HEADERS = Object.values(
  IdentityHeader,
) as readonly IdentityHeaderName[];

export const UNTRUSTED_PROXY_HEADERS = [
  'forwarded',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-proto',
  'x-forwarded-port',
  'x-real-ip',
] as const;

export const STRIPPED_HEADERS = [
  ...IDENTITY_HEADERS,
  ...UNTRUSTED_PROXY_HEADERS,
] as const;
