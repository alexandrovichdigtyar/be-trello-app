import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
  type JWTVerifyOptions,
} from 'jose';
import { getGatewayEnv } from '../env';

let jwks: JWTVerifyGetKey | undefined;

function getJwks(): JWTVerifyGetKey {
  if (!jwks) {
    const env = getGatewayEnv();
    jwks = createRemoteJWKSet(new URL(env.jwksUrl), {
      cacheMaxAge: env.jwtJwksCacheMaxAgeMs,
    });
  }
  return jwks;
}

export async function verifyTokenWithJwks(token: string): Promise<JWTPayload> {
  const env = getGatewayEnv();

  const verifyOptions: JWTVerifyOptions = {
    clockTolerance: env.jwtClockToleranceSeconds,
  };

  if (env.jwtIssuer) verifyOptions.issuer = env.jwtIssuer;
  if (env.jwtAudience) verifyOptions.audience = env.jwtAudience;

  const { payload } = await jwtVerify(token.trim(), getJwks(), verifyOptions);
  return payload;
}
