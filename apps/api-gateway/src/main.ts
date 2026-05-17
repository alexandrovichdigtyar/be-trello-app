import { env } from "./env";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import fastifyCors from "@fastify/cors";
import { AppModule } from "./app.module";
import { registerProxies } from "./proxy/proxy.bootstrap";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bodyParser: false },
  );

  await app.register(fastifyCors, {
    origin: [...env.TRUSTED_ORIGINS],
    credentials: true,
  });

  registerProxies(app);

  await app.listen(env.PORT, env.BIND_ADDRESS);
  console.log(`api-gateway is running on http://localhost:${env.PORT}`);
}

void bootstrap();
