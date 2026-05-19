import type { IncomingHttpHeaders } from 'http';

const GATEWAY_AUTH_PREFIX = '/api/auth';

/**
 * Маршруты «только для гостя»: повторный sign-in / sign-up при живой cookie-сессии.
 * OPTIONS и не-POST не трогаем (в т.ч. preflight).
 */
export function isGuestOnlyAuthRoute(method: string, gatewayPath: string): boolean {
  if (method === 'OPTIONS') {
    return false;
  }
  if (method !== 'POST') {
    return false;
  }

  const path = (gatewayPath.split('?')[0] ?? gatewayPath).toLowerCase();
  if (!path.startsWith(`${GATEWAY_AUTH_PREFIX}/`)) {
    return false;
  }

  const relative = path.slice(GATEWAY_AUTH_PREFIX.length);
  return relative.startsWith('/sign-in') || relative.startsWith('/sign-up');
}

function cookieHeader(headers: IncomingHttpHeaders): string | undefined {
  const raw = headers.cookie;
  if (raw === undefined) {
    return undefined;
  }
  return Array.isArray(raw) ? raw.join('; ') : raw;
}

/**
 * Проверяет, есть ли у клиента валидная Better Auth сессия на identity (по cookie).
 * Использует GET /api/v1/users/me — тот же механизм, что и в identity-service.
 */
export async function checkSessionOnIdentity(
  identityUpstream: string,
  headers: IncomingHttpHeaders,
): Promise<boolean> {
  const cookie = cookieHeader(headers);
  if (!cookie) {
    return false;
  }

  const base = identityUpstream.replace(/\/+$/, '');
  const checkPath =
    process.env.IDENTITY_SESSION_CHECK_PATH?.replace(/^\/+/, '') ?? 'api/v1/users/me';
  const url = `${base}/${checkPath}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { cookie },
      signal: AbortSignal.timeout(
        Number(process.env.IDENTITY_SESSION_CHECK_TIMEOUT_MS) || 5000,
      ),
    });
    return res.ok;
  } catch {
    return false;
  }
}
