import type { FastifyReply, FastifyRequest } from 'fastify';
import { GUEST_ONLY_PATHS } from '../proxy/proxy.constants';
import { verifyTokenWithJwks } from './jwt-verify';

/**
 * Best-effort guard for guest-only auth routes (sign-in/sign-up).
 * If the client sends a valid Bearer JWT, block with 409.
 * Otherwise let identity-service handle cookie-based session checks.
 */
export function createGuestOnlyPreHandler() {
  return async function guestOnlyPreHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    if (request.method !== 'POST') return;

    const path = request.url.split('?')[0] ?? request.url;
    if (!GUEST_ONLY_PATHS.has(path)) return;

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return;

    const token = authHeader.slice('Bearer '.length).trim();
    try {
      await verifyTokenWithJwks(token);
      return reply.code(409).send({
        code: 'ALREADY_AUTHENTICATED',
        message: 'You are already signed in. Sign out first.',
      });
    } catch {
      // Invalid Bearer — best-effort: let identity-service decide.
    }
  };
}
