export const ProxyRoutePrefixes = {
  gatewayIdentityAuth: '/api/auth',
  gatewayBoards: '/api/boards',
  upstreamIdentityAuth: '/api/v1/auth',
  upstreamBoards: '/boards',
} as const;

export const IdentityUpstreamPaths = {
  usersMe: '/api/v1/users/me',
} as const;

export const PUBLIC_EXACT_PATHS: ReadonlySet<string> = new Set(['/health']);

/**
 * POST-only gateway paths where an already-authenticated user should receive
 * 409 ALREADY_AUTHENTICATED instead of being forwarded to identity.
 */
export const GUEST_ONLY_PATHS: ReadonlySet<string> = new Set([
  '/api/auth/sign-in/email',
  '/api/auth/sign-up/email',
]);
