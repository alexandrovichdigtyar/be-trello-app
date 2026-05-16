import { env } from "./env";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { registerBoardsProxy } from "./proxy/proxy.bootstrap";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bodyParser: false },
  );

  registerBoardsProxy(app);

  await app.listen(env.PORT, env.BIND_ADDRESS);
  console.log(`api-gateway is running on http://localhost:${env.PORT}`);
}

void bootstrap();
