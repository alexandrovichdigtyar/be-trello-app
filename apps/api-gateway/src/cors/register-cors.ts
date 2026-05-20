import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import cors from '@fastify/cors';
import { CorsDefaults } from '../config/defaults';

export type CorsConfig = {
  origins: readonly string[];
  preflightMaxAgeSeconds: number;
};

export async function registerCors(
  app: NestFastifyApplication,
  config: CorsConfig,
): Promise<void> {
  await app.register(cors, {
    origin: [...config.origins],
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    maxAge: config.preflightMaxAgeSeconds,
  });
}

export function parseCorsOrigins(raw: string | undefined): readonly string[] {
  const parsed = raw
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return parsed?.length ? parsed : CorsDefaults.origins;
}
