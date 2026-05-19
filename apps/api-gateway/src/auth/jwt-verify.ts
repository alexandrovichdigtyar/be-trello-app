import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
  type JWTVerifyOptions,
} from 'jose';

let jwks: JWTVerifyGetKey | undefined;

function getJwks(): JWTVerifyGetKey {
  if (!jwks) {
    const jwksUri =
      process.env.JWKS_URL?.trim() ??
      'http://localhost:4002/api/v1/auth/jwks';
    jwks = createRemoteJWKSet(new URL(jwksUri), {
      cacheMaxAge: 60 * 60 * 1000,
    });
  }
  return jwks;
}

export async function verifyTokenWithJwks(token: string): Promise<JWTPayload> {
  const verifyOptions: JWTVerifyOptions = {
    clockTolerance: 30,
  };
  const issuer = process.env.JWT_ISSUER?.trim();
  const audience = process.env.JWT_AUDIENCE?.trim();
  
  if (issuer) verifyOptions.issuer = issuer;
  if (audience) verifyOptions.audience = audience;

  const { payload } = await jwtVerify(token.trim(), getJwks(), verifyOptions);
  return payload;
}
