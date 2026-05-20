export const DefaultUpstream = {
  identity: 'http://127.0.0.1:4002',
  boards: 'http://127.0.0.1:4001',
} as const;

export const IdentityPaths = {
  jwksPath: '/api/v1/auth/jwks',
} as const;

export const GatewayListenDefaults = {
  port: 4000,
  host: '0.0.0.0',
} as const;

export const JwtVerificationDefaults = {
  jwksCacheMaxAgeMs: 60 * 60 * 1000,
  clockToleranceSeconds: 30,
} as const;

export const GuestOnlyGuardDefaults = {
  sessionCheckTimeoutMs: 5_000,
} as const;

export const CorsDefaults = {
  origins: ['http://localhost:3000'],
  preflightMaxAgeSeconds: 600,
} as const;
