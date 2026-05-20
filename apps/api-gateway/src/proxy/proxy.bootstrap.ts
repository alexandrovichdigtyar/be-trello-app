import type { FastifyInstance } from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';
import { createGuestOnlyPreHandler } from '../auth/guest-only-guard';
import { ProxyRoutePrefixes } from './proxy.constants';

export type ProxyRegistrationDeps = {
  identityUpstreamUrl: string;
  boardsUpstreamUrl: string;
  sessionCheckTimeoutMs: number;
};

export async function registerHttpProxies(
  fastify: FastifyInstance,
  deps: ProxyRegistrationDeps,
): Promise<void> {
  await fastify.register(fastifyHttpProxy, {
    upstream: deps.identityUpstreamUrl,
    prefix: ProxyRoutePrefixes.gatewayIdentityAuth,
    rewritePrefix: ProxyRoutePrefixes.upstreamIdentityAuth,
    http2: false,
    preHandler: createGuestOnlyPreHandler(
      deps.identityUpstreamUrl,
      deps.sessionCheckTimeoutMs,
    ),
  });

  await fastify.register(fastifyHttpProxy, {
    upstream: deps.boardsUpstreamUrl,
    prefix: ProxyRoutePrefixes.gatewayBoards,
    rewritePrefix: ProxyRoutePrefixes.upstreamBoards,
    http2: false,
  });
}
