import type { FastifyInstance } from 'fastify';
import { GUEST_ONLY_PATHS, IdentityUpstreamPaths } from '../proxy/proxy.constants';

async function hasActiveSession(
  identityUpstreamUrl: string,
  cookie: string,
  timeoutMs: number,
  log: FastifyInstance['log'],
): Promise<boolean> {
  const url = `${identityUpstreamUrl}${IdentityUpstreamPaths.usersMe}`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { cookie },
      signal: AbortSignal.timeout(timeoutMs),
    });
    return res.ok;
  } catch (err) {
    log.warn({ err }, 'guest-only guard: session check failed, failing open');
    return false;
  }
}

export function registerGuestOnlyGuard(
  fastify: FastifyInstance,
  identityUpstreamUrl: string,
  sessionCheckTimeoutMs: number,
): void {
  fastify.addHook('preHandler', async (request, reply) => {
    if (request.method !== 'POST') return;

    const path = request.url.split('?')[0] ?? request.url;
    if (!GUEST_ONLY_PATHS.has(path)) return;

    const cookie = request.headers.cookie;
    if (!cookie) return;

    const active = await hasActiveSession(
      identityUpstreamUrl,
      Array.isArray(cookie) ? cookie.join('; ') : cookie,
      sessionCheckTimeoutMs,
      fastify.log,
    );

    if (active) {
      return reply.code(409).send({
        code: 'ALREADY_AUTHENTICATED',
        message: 'You are already signed in. Sign out first.',
      });
    }
  });
}
