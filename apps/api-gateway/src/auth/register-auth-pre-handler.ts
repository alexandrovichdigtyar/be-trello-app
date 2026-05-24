import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { JWTPayload } from 'jose';
import { IdentityHeader, STRIPPED_HEADERS } from '../proxy/identity-headers';
import { verifyTokenWithJwks } from './jwt-verify';

type TrustedIdentityJwtPayload = JWTPayload & {
  userId?: string;
  orgId?: string;
  id?: string;
  perms?: string[];
};

function applyTrustedIdentityHeaders(
  request: FastifyRequest,
  payload: TrustedIdentityJwtPayload,
): void {
  const userId = String(payload.userId ?? payload.sub ?? payload.id ?? '');
  if (!userId) throw new Error('Missing user id in token');

  request.headers[IdentityHeader.UserId] = userId;
  request.headers[IdentityHeader.OrgId] = String(payload.orgId ?? '');
  request.headers[IdentityHeader.Perms] = (payload.perms ?? []).join(',');
}

export function stripIncomingIdentityHeaders(request: FastifyRequest): void {
  for (const header of STRIPPED_HEADERS) {
    delete request.headers[header];
  }
}

export function registerStripUntrustedHeaders(fastify: FastifyInstance): void {
  fastify.addHook('onRequest', async (request) => {
    stripIncomingIdentityHeaders(request);
  });
}

export function createBearerAuthPreHandler() {
  return async function bearerAuthPreHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    if (request.method === 'OPTIONS') return;

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    try {
      const payload = await verifyTokenWithJwks(token);
      applyTrustedIdentityHeaders(request, payload as TrustedIdentityJwtPayload);
      delete request.headers.authorization;
    } catch {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
  };
}
