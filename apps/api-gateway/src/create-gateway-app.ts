import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { registerCors } from './cors/register-cors';
import { CorsDefaults } from './config/defaults';
import { getGatewayEnv } from './env';
import { registerStripUntrustedHeaders } from './auth/register-auth-pre-handler';
import { registerHttpProxies } from './proxy/proxy.bootstrap';

export type CreateGatewayAppOptions = {
  identityUpstreamUrl?: string;
  boardsUpstreamUrl?: string;
  workspaceUpstreamUrl?: string;
  corsOrigins?: readonly string[];
  corsPreflightMaxAgeSeconds?: number;
};

export async function createGatewayApplication(
  options: CreateGatewayAppOptions = {},
): Promise<NestFastifyApplication> {
  const env = getGatewayEnv();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bodyParser: false },
  );

  await registerCors(app, {
    origins: options.corsOrigins ?? env.corsOrigins,
    preflightMaxAgeSeconds:
      options.corsPreflightMaxAgeSeconds ?? env.corsPreflightMaxAgeSeconds,
  });

  const fastify = app.getHttpAdapter().getInstance();

  registerStripUntrustedHeaders(fastify);
  await registerHttpProxies(fastify, {
    identityUpstreamUrl: options.identityUpstreamUrl ?? env.identityUpstreamUrl,
    boardsUpstreamUrl: options.boardsUpstreamUrl ?? env.boardsUpstreamUrl,
    workspaceUpstreamUrl:
      options.workspaceUpstreamUrl ?? env.workspaceUpstreamUrl,
  });

  await app.init();
  return app;
}

export const gatewayTestDefaults = {
  corsOrigins: CorsDefaults.origins,
  corsPreflightMaxAgeSeconds: CorsDefaults.preflightMaxAgeSeconds,
} as const;
