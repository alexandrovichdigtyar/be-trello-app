import {
  DefaultUpstream,
  GatewayListenDefaults,
  IdentityPaths,
  JwtVerificationDefaults,
  CorsDefaults,
} from './config/defaults';
import { parseCorsOrigins } from './cors/register-cors';

export type GatewayEnv = {
  port: number;
  bindAddress: string;
  identityUpstreamUrl: string;
  boardsUpstreamUrl: string;
  jwksUrl: string;
  jwtIssuer?: string;
  jwtAudience?: string;
  jwtJwksCacheMaxAgeMs: number;
  jwtClockToleranceSeconds: number;
  corsOrigins: readonly string[];
  corsPreflightMaxAgeSeconds: number;
};

function trimTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, '');
}

function parsePositiveInt(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function loadGatewayEnv(): GatewayEnv {
  const identityBase = trimTrailingSlashes(
    process.env.IDENTITY_UPSTREAM_URL ?? DefaultUpstream.identity,
  );
  const boardsBase = trimTrailingSlashes(
    process.env.BOARDS_UPSTREAM_URL ?? DefaultUpstream.boards,
  );

  const jwksUrl =
    process.env.JWKS_URL?.trim() || `${identityBase}${IdentityPaths.jwksPath}`;

  return {
    port: parsePositiveInt(process.env.PORT) ?? GatewayListenDefaults.port,
    bindAddress: process.env.BIND_ADDRESS ?? GatewayListenDefaults.host,
    identityUpstreamUrl: identityBase,
    boardsUpstreamUrl: boardsBase,
    jwksUrl,
    jwtIssuer: process.env.JWT_ISSUER?.trim() || undefined,
    jwtAudience: process.env.JWT_AUDIENCE?.trim() || undefined,
    jwtJwksCacheMaxAgeMs:
      parsePositiveInt(process.env.JWT_JWKS_CACHE_MAX_AGE_MS) ??
      JwtVerificationDefaults.jwksCacheMaxAgeMs,
    jwtClockToleranceSeconds:
      parsePositiveInt(process.env.JWT_CLOCK_TOLERANCE_SECONDS) ??
      JwtVerificationDefaults.clockToleranceSeconds,
    corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
    corsPreflightMaxAgeSeconds:
      parsePositiveInt(process.env.CORS_PREFLIGHT_MAX_AGE_SECONDS) ??
      CorsDefaults.preflightMaxAgeSeconds,
  };
}

let cached: GatewayEnv | null = null;

export function getGatewayEnv(): GatewayEnv {
  cached ??= loadGatewayEnv();
  return cached;
}
