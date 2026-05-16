import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import fastifyHttpProxy from "@fastify/http-proxy";
import { env } from "../env";
import { BOARDS_PROXY } from "./proxy.constants";
import { identityPreHandler } from "./identity.pre-handler";

export function registerBoardsProxy(app: NestFastifyApplication): void {
  app.getHttpAdapter().getInstance().register(fastifyHttpProxy, {
    upstream: env.BOARDS_SERVICE_URL,
    proxyPayloads: false,
    prefix: BOARDS_PROXY.prefix,
    rewritePrefix: BOARDS_PROXY.rewritePrefix,
    preHandler: identityPreHandler,
  });
}
