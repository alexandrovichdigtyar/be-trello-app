import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import fastifyHttpProxy from '@fastify/http-proxy';
import { registerBearerAuthPreHandler } from './auth/register-bearer-pre-handler';
import { checkSessionOnIdentity, isGuestOnlyAuthRoute } from './auth/guest-only-identity';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const port = Number(process.env.PORT) || 4000;
  const host = process.env.BIND_ADDRESS ?? '0.0.0.0';

  const identityUpstream =
    process.env.IDENTITY_UPSTREAM_URL?.replace(/\/+$/, '') ??
    'http://127.0.0.1:4002';
  const boardsUpstream =
    process.env.BOARDS_UPSTREAM_URL?.replace(/\/+$/, '') ??
    'http://127.0.0.1:4001';


  const fastify = app.getHttpAdapter().getInstance();

  registerBearerAuthPreHandler(fastify);

  await fastify.register(fastifyHttpProxy, {
    upstream: identityUpstream,
    prefix: '/api/auth',
    rewritePrefix: '/api/v1/auth',
    http2: false,
    preHandler: async (request, reply) => {
      const path = request.url.split('?')[0] ?? '';
      const method = request.method;
      if (!isGuestOnlyAuthRoute(method, path)) return;
      const hasSession = await checkSessionOnIdentity(identityUpstream, request.headers);
      if (hasSession) {
        return reply.code(409).send({ code: 'ALREADY_AUTHENTICATED' });
      }
    }
  });

  // e.g. GET /api/boards/demo → http://boards:4001/boards/demo (Bearer проверяется на boards-service)
  await fastify.register(fastifyHttpProxy, {
    upstream: boardsUpstream,
    prefix: '/api/boards',
    rewritePrefix: '/boards',
    http2: false,
    preHandler: async (request, _reply) => {
      
      const perms = request.headers['x-perms'];
      const userId = request.headers['x-user-id'];
      const orgId = request.headers['x-org-id'];
      console.log('[boards proxy]', { userId, orgId, perms });
    },

  });

  await app.listen(port, host);
}

void bootstrap();
