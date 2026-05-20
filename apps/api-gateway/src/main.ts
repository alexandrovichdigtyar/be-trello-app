import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { getGatewayEnv } from './env';
import { registerAuthPreHandler } from './auth/register-auth-pre-handler';
import { registerGuestOnlyGuard } from './auth/guest-only-guard';
import { registerHttpProxies } from './proxy/proxy.bootstrap';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const env = getGatewayEnv();
  const fastify = app.getHttpAdapter().getInstance();

  registerAuthPreHandler(fastify);
  registerGuestOnlyGuard(fastify, env.identityUpstreamUrl, env.sessionCheckTimeoutMs);
  await registerHttpProxies(fastify, {
    identityUpstreamUrl: env.identityUpstreamUrl,
    boardsUpstreamUrl: env.boardsUpstreamUrl,
  });

  await app.listen(env.port, env.bindAddress);
}

void bootstrap();
