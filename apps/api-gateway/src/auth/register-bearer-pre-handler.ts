import type { FastifyInstance, FastifyRequest } from 'fastify';
import { verifyTokenWithJwks } from './jwt-verify';
import { shouldSkipBearerAuth } from './public-routes';
import { IDENTITY_HEADERS, IdentityHeader } from 'src/proxy/identity-headers';
import { JwtPayload } from 'jsonwebtoken';

function applyTrustedIdentityHeaders(request: FastifyRequest, payload: JwtPayload): void {
    const ext = payload as JwtPayload & { userId?: string; orgId?: string; perms?: string[] };
    const userId = String(ext.userId ?? payload.sub ?? payload.id ?? '');
    if (!userId) {
      throw new Error('Missing user id in token');
    }
    // пример кастомных claims (имена могут отличаться — проверь payload):
    const orgId = String((payload as JwtPayload & { orgId?: string }).orgId ?? '');
    const permsRaw = (payload as JwtPayload & { perms?: string[] }).perms;
    const perms = Array.isArray(permsRaw) ? permsRaw.join(',') : String(permsRaw ?? '');
    request.headers[IdentityHeader.UserId] = userId;
    request.headers[IdentityHeader.OrgId] = orgId;
    request.headers[IdentityHeader.Perms] = perms;
  }

export function stripIncomingIdentityHeaders(request: FastifyRequest): void {
    for (const header of IDENTITY_HEADERS) {
      delete request.headers[header];
    }

    delete request.headers.forwarded;
  }


export function registerBearerAuthPreHandler(fastify: FastifyInstance): void {
  fastify.addHook('preHandler', async (request, reply) => {
    const path = request.url.split('?')[0] ?? request.url;

    if (shouldSkipBearerAuth(path, request.method)) {
      return;
    }

    const authHeader = request.headers.authorization;
    console.log('authHeader', authHeader);
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    try {
        console.log('token', token);
        const payload = await verifyTokenWithJwks(token);
        console.log('payload', payload);

      stripIncomingIdentityHeaders(request);
      applyTrustedIdentityHeaders(request, payload as JwtPayload);

    } catch {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
  });
}
