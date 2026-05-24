import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as jwtVerify from '../auth/jwt-verify';
import type { GatewayTestContext } from '../test/gateway-test-context';
import {
  closeGatewayTestContext,
  createGatewayTestContext,
} from '../test/gateway-test-context';

describe('proxy body forwarding', () => {
  let context: GatewayTestContext;

  beforeEach(async () => {
    context = await createGatewayTestContext();
  });

  afterEach(async () => {
    await closeGatewayTestContext(context);
  });

  it('forwards JSON body byte-for-byte (preserves formatting)', async () => {
    const rawBody = '{\n  "name": "QA",\n  "count": 42\n}';

    const response = await context.inject({
      method: 'POST',
      url: '/api/auth/sign-up/email',
      headers: {
        'content-type': 'application/json',
      },
      payload: rawBody,
    });

    expect(response.statusCode).toBe(200);

    const upstream = context.echo.requests.at(-1);
    expect(upstream?.body.toString('utf8')).toBe(rawBody);
    expect(upstream?.path).toBe('/api/v1/auth/sign-up/email');
  });

  it('forwards UTF-8 body without corruption', async () => {
    const rawBody = '{"message":"Привіт 🚀"}';

    const response = await context.inject({
      method: 'POST',
      url: '/api/auth/sign-in/email',
      headers: {
        'content-type': 'application/json; charset=utf-8',
      },
      payload: rawBody,
    });

    expect(response.statusCode).toBe(200);
    expect(context.echo.requests.at(-1)?.body.toString('utf8')).toBe(rawBody);
  });

  it('forwards non-JSON payloads without re-encoding', async () => {
    const rawBody = 'plain-text-payload';

    const response = await context.inject({
      method: 'POST',
      url: '/api/auth/custom-endpoint',
      headers: {
        'content-type': 'text/plain',
      },
      payload: rawBody,
    });

    expect(response.statusCode).toBe(200);
    expect(context.echo.requests.at(-1)?.body.toString('utf8')).toBe(rawBody);
  });

  it('forwards empty POST body', async () => {
    const response = await context.inject({
      method: 'POST',
      url: '/api/auth/empty',
      headers: {
        'content-type': 'application/json',
      },
      payload: '',
    });

    expect(response.statusCode).toBe(200);
    expect(context.echo.requests.at(-1)?.body.toString('utf8')).toBe('');
  });

  it('forwards numeric-looking JSON without type coercion', async () => {
    const rawBody = '{"amount":"00123","active":true}';

    await context.inject({
      method: 'POST',
      url: '/api/auth/payment',
      headers: {
        'content-type': 'application/json',
      },
      payload: rawBody,
    });

    expect(context.echo.requests.at(-1)?.body.toString('utf8')).toBe(rawBody);
  });
});

describe('proxy route rewrite', () => {
  let context: GatewayTestContext;

  beforeEach(async () => {
    context = await createGatewayTestContext();
  });

  afterEach(async () => {
    await closeGatewayTestContext(context);
  });

  it('rewrites /api/auth prefix to upstream /api/v1/auth', async () => {
    await context.inject({
      method: 'GET',
      url: '/api/auth/token',
    });

    expect(context.echo.requests.at(-1)?.path).toBe('/api/v1/auth/token');
  });
});

describe('untrusted header stripping', () => {
  let context: GatewayTestContext;

  beforeEach(async () => {
    context = await createGatewayTestContext();
  });

  afterEach(async () => {
    await closeGatewayTestContext(context);
  });

  it('strips spoofed identity headers on public auth route', async () => {
    await context.inject({
      method: 'POST',
      url: '/api/auth/sign-in/email',
      headers: {
        'content-type': 'application/json',
        'x-user-id': 'attacker',
        'x-org-id': 'evil-org',
        'x-perms': 'project:delete',
      },
      payload: '{}',
    });

    const upstream = context.echo.requests.at(-1);
    expect(upstream?.headers['x-user-id']).toBeUndefined();
    expect(upstream?.headers['x-org-id']).toBeUndefined();
    expect(upstream?.headers['x-perms']).toBeUndefined();
  });

  it('strips spoofed proxy-chain headers on public auth route', async () => {
    await context.inject({
      method: 'POST',
      url: '/api/auth/sign-in/email',
      headers: {
        'content-type': 'application/json',
        forwarded: 'for=10.0.0.1;by=internal',
        'x-forwarded-for': '1.2.3.4',
        'x-forwarded-host': 'evil.example.com',
        'x-forwarded-proto': 'https',
        'x-forwarded-port': '443',
        'x-real-ip': '5.6.7.8',
      },
      payload: '{}',
    });

    const upstream = context.echo.requests.at(-1);
    expect(upstream?.headers['forwarded']).toBeUndefined();
    expect(upstream?.headers['x-forwarded-for']).toBeUndefined();
    expect(upstream?.headers['x-forwarded-host']).toBeUndefined();
    expect(upstream?.headers['x-forwarded-proto']).toBeUndefined();
    expect(upstream?.headers['x-forwarded-port']).toBeUndefined();
    expect(upstream?.headers['x-real-ip']).toBeUndefined();
  });
});

describe('bearer auth scope', () => {
  let context: GatewayTestContext;

  beforeEach(async () => {
    context = await createGatewayTestContext();
  });

  afterEach(async () => {
    await closeGatewayTestContext(context);
  });

  it('returns 401 on /api/boards without Bearer', async () => {
    const response = await context.inject({
      method: 'GET',
      url: '/api/boards/demo',
    });

    expect(response.statusCode).toBe(401);
    expect(context.echo.requests).toHaveLength(0);
  });

  it('returns 401 on /api/boards with invalid Bearer', async () => {
    const response = await context.inject({
      method: 'GET',
      url: '/api/boards/demo',
      headers: {
        authorization: 'Bearer not.a.real.token',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(context.echo.requests).toHaveLength(0);
  });

  it('does not require Bearer on /api/auth (passes through)', async () => {
    const response = await context.inject({
      method: 'GET',
      url: '/api/auth/jwks',
    });

    expect(response.statusCode).toBe(200);
    expect(context.echo.requests.at(-1)?.path).toBe('/api/v1/auth/jwks');
  });
});

describe('guest-only guard (best-effort Bearer)', () => {
  let context: GatewayTestContext;

  beforeEach(async () => {
    context = await createGatewayTestContext();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await closeGatewayTestContext(context);
  });

  it('returns 409 on sign-in when Bearer JWT is valid', async () => {
    vi.spyOn(jwtVerify, 'verifyTokenWithJwks').mockResolvedValue({
      sub: 'user-1',
    });

    const response = await context.inject({
      method: 'POST',
      url: '/api/auth/sign-in/email',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer valid.jwt.token',
      },
      payload: '{}',
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ code: 'ALREADY_AUTHENTICATED' });
    expect(context.echo.requests).toHaveLength(0);
  });

  it('forwards sign-in when only a session cookie is present', async () => {
    const response = await context.inject({
      method: 'POST',
      url: '/api/auth/sign-in/email',
      headers: {
        'content-type': 'application/json',
        cookie: 'better-auth.session_token=fake.session',
      },
      payload: '{}',
    });

    expect(response.statusCode).toBe(200);
    expect(context.echo.requests.at(-1)?.path).toBe('/api/v1/auth/sign-in/email');
  });

  it('forwards sign-in when Bearer JWT is invalid (best-effort)', async () => {
    vi.spyOn(jwtVerify, 'verifyTokenWithJwks').mockRejectedValue(
      new Error('invalid token'),
    );

    const response = await context.inject({
      method: 'POST',
      url: '/api/auth/sign-in/email',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer invalid.jwt.token',
      },
      payload: '{}',
    });

    expect(response.statusCode).toBe(200);
    expect(context.echo.requests.at(-1)?.path).toBe('/api/v1/auth/sign-in/email');
  });
});
