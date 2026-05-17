import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { jwt, organization } from "better-auth/plugins";
import { env } from "../env";
import { DATABASE_PROVIDER, JWT_TTL } from "./auth.constants";
import { defineJwtPayload } from "./jwt-payload.factory";
import { ac, roles } from "./permissions";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: DATABASE_PROVIDER }),
  emailAndPassword: { enabled: true },
  trustedOrigins: [...env.TRUSTED_ORIGINS],
  rateLimit: {
    enabled: true,
    max: env.RATE_LIMIT_MAX,
  },
  plugins: [
    organization({ ac, roles }),
    jwt({
      jwt: {
        expirationTime: JWT_TTL,
        definePayload: defineJwtPayload,
      },
    }),
  ],
});
