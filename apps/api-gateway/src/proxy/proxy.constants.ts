export const ProxyRoutePrefixes = {
  gatewayIdentityAuth: '/api/auth',
  gatewayBoards: '/api/boards',
  gatewayWorkspaces: '/api/workspaces',
  upstreamIdentityAuth: '/api/v1/auth',
  upstreamBoards: '/boards',
  upstreamWorkspaces: '/workspaces',
} as const;

export const PUBLIC_EXACT_PATHS: ReadonlySet<string> = new Set(['/health']);

/**
 * POST-only gateway paths where an already-authenticated user (valid Bearer JWT)
 * should receive 409 ALREADY_AUTHENTICATED instead of being forwarded.
 */
export const GUEST_ONLY_PATHS: ReadonlySet<string> = new Set([
  '/api/auth/sign-in/email',
  '/api/auth/sign-up/email',
]);
