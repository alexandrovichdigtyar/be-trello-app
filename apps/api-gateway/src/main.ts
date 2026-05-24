import 'dotenv/config';
import 'reflect-metadata';
import { createGatewayApplication } from './create-gateway-app';
import { getGatewayEnv } from './env';

async function bootstrap() {
  const env = getGatewayEnv();
  const app = await createGatewayApplication({
    identityUpstreamUrl: env.identityUpstreamUrl,
    boardsUpstreamUrl: env.boardsUpstreamUrl,
    corsOrigins: env.corsOrigins,
    corsPreflightMaxAgeSeconds: env.corsPreflightMaxAgeSeconds,
  });

  await app.listen(env.port, env.bindAddress);
}

void bootstrap();
