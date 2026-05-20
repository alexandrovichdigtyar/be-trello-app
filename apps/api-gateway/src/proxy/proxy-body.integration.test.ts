import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
