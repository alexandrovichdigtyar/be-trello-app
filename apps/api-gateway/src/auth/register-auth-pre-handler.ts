import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { JWTPayload } from 'jose';
import {
  IDENTITY_HEADERS,
  IdentityHeader,
} from '../proxy/identity-headers';
import { verifyTokenWithJwks } from './jwt-verify';
import { requiresBearerJwt } from './auth-route-policy';

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
  for (const header of IDENTITY_HEADERS) {
    delete request.headers[header];
  }
}

export function registerAuthPreHandler(fastify: FastifyInstance): void {
  fastify.addHook('preHandler', async (request, reply) => {
    const authHeader = request.headers.authorization;
    stripIncomingIdentityHeaders(request);

    const path = request.url.split('?')[0] ?? request.url;
    if (!requiresBearerJwt(path, request.method)) {
      return;
    }

    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    try {
      const payload = await verifyTokenWithJwks(token);
      applyTrustedIdentityHeaders(request, payload as TrustedIdentityJwtPayload);
    } catch {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
  });
}
