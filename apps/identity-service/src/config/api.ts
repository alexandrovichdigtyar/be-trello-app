import { DEFAULT_PORT } from './defaults';

const rawVersion = process.env.API_VERSION ?? 'v1';
const versionSegment = rawVersion.replace(/^\/+|\/+$/g, '') || 'v1';

export const API_VERSION = versionSegment;

export const apiPrefix = `/api/${API_VERSION}` as const;

export const authMountPath = `${apiPrefix}/auth` as const;

function trimTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, '');
}

export function getPublicOrigin(): string {
  const fromEnv = process.env.PUBLIC_ORIGIN ?? process.env.BETTER_AUTH_ORIGIN;
  const fallback = `http://localhost:${process.env.PORT ?? String(DEFAULT_PORT)}`;
  return trimTrailingSlashes(fromEnv ?? fallback);
}

export function getAuthBaseUrl(): string {
  if (process.env.BETTER_AUTH_URL) {
    return trimTrailingSlashes(process.env.BETTER_AUTH_URL);
  }
  return `${getPublicOrigin()}${authMountPath}`;
}
