import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  createGatewayApplication,
  gatewayTestDefaults,
} from '../create-gateway-app';
import { createEchoServer, type EchoServer } from './echo-server';

export type GatewayTestContext = {
  app: NestFastifyApplication;
  echo: EchoServer;
  inject: NestFastifyApplication['inject'];
};

export async function createGatewayTestContext(): Promise<GatewayTestContext> {
  const echo = await createEchoServer();
  const app = await createGatewayApplication({
    identityUpstreamUrl: echo.url,
    boardsUpstreamUrl: echo.url,
    ...gatewayTestDefaults,
  });

  return {
    app,
    echo,
    inject: app.inject.bind(app),
  };
}

export async function closeGatewayTestContext(
  context: GatewayTestContext,
): Promise<void> {
  await context.app.close();
  await context.echo.close();
}
