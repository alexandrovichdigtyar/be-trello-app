import "dotenv/config";
import { z } from "zod";

const csvUrls = z
  .string()
  .min(1)
  .transform((s) =>
    s
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.url()).min(1));

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4002),
  BIND_ADDRESS: z.string().min(1).default("0.0.0.0"),
  DATABASE_URL: z.url(),
  TRUSTED_ORIGINS: csvUrls,
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "[env] Invalid environment variables:\n",
    JSON.stringify(z.treeifyError(parsed.error), null, 2),
  );
  process.exit(1);
}

export const env = Object.freeze(parsed.data);
export type Env = typeof env;
