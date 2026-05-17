import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import fastifyHttpProxy from "@fastify/http-proxy";
import { env } from "../env";
import {
  AUTH_API_PREFIX,
  BOARDS_PROXY,
  ME_PROXY,
} from "./proxy.constants";
import {
  authRoutesStripPreHandler,
  boardsIdentityPreHandler,
} from "./identity.pre-handler";

export function registerProxies(app: NestFastifyApplication): void {
  const instance = app.getHttpAdapter().getInstance();

  instance.register(fastifyHttpProxy, {
    upstream: env.IDENTITY_SERVICE_URL,
    proxyPayloads: false,
    prefix: AUTH_API_PREFIX,
    rewritePrefix: AUTH_API_PREFIX,
    preHandler: authRoutesStripPreHandler,
  });

  instance.register(fastifyHttpProxy, {
    upstream: env.IDENTITY_SERVICE_URL,
    proxyPayloads: false,
    prefix: ME_PROXY.prefix,
    rewritePrefix: ME_PROXY.rewritePrefix,
    preHandler: authRoutesStripPreHandler,
  });

  instance.register(fastifyHttpProxy, {
    upstream: env.BOARDS_SERVICE_URL,
    proxyPayloads: false,
    prefix: BOARDS_PROXY.prefix,
    rewritePrefix: BOARDS_PROXY.rewritePrefix,
    preHandler: boardsIdentityPreHandler,
  });
}
