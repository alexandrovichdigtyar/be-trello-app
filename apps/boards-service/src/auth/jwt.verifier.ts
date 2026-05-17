import { Injectable, OnModuleInit } from '@nestjs/common';
import { type IdentityClaims } from '@trello-app/shared';
import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
} from 'jose';

@Injectable()
export class JwtVerifier implements OnModuleInit {
  private jwks!: JWTVerifyGetKey;

  onModuleInit() {
    const jwksUrl = process.env.AUTH_JWKS_URL;
    if (!jwksUrl) {
      throw new Error('AUTH_JWKS_URL is not set');
    }
    this.jwks = createRemoteJWKSet(new URL(jwksUrl), {
      cacheMaxAge: 10 * 60 * 1000,
      cooldownDuration: 30 * 1000,
    });
  }

  async verify(token: string): Promise<IdentityClaims> {
    const { payload } = await jwtVerify<IdentityClaims & JWTPayload>(
      token,
      this.jwks,
    );
    if (typeof payload.userId !== 'string') {
      throw new Error('JWT missing userId claim');
    }
    if (!Array.isArray(payload.perms)) {
      throw new Error('JWT missing perms claim');
    }
    return payload;
  }
}
