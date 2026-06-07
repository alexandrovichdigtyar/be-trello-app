import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { auth } from './auth';
import { apiPrefix, authMountPath } from './config/api';
import {
  DEFAULT_BIND_ADDRESS,
  DEFAULT_PORT,
  HTTP_STATUS_UNAUTHORIZED,
} from './config/defaults';
import { kafkaProducer } from './kafka.producer';

const app = new Hono();

app.on(['POST', 'GET'], `${authMountPath}/*`, (c) => auth.handler(c.req.raw));

app.get(`${apiPrefix}/users/me`, async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ message: 'Unauthorized' }, HTTP_STATUS_UNAUTHORIZED);
  }
  return c.json(session);
});

app.get('/health', (c) => c.json({ ok: true }));

const port = Number(process.env.PORT) || DEFAULT_PORT;
const hostname = process.env.BIND_ADDRESS ?? DEFAULT_BIND_ADDRESS;

process.on('SIGINT', async () => {
  await kafkaProducer.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await kafkaProducer.disconnect();
  process.exit(0);
});

const bootstrap = async () => {
  await kafkaProducer.connect();
  
  serve(
    { fetch: app.fetch, port, hostname },
    (info) => {
      console.log(`Listening on http://${hostname}:${info.port}`);
    },
  );
};

bootstrap();