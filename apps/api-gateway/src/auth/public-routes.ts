/**
 * Routes that skip Bearer JWT verification on the gateway.
 * Keep in sync with proxy mounts (e.g. `/api/auth` → identity).
 */
export function shouldSkipBearerAuth(path: string, method: string): boolean {
  if (method === 'OPTIONS') {
    return true;
  }

  if (path === '/health' || path === '/hello1') {
    return true;
  }

  if (path.startsWith('/api/auth')) {
    return true;
  }

  return false;
}
