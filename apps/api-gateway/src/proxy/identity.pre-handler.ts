import { HttpStatus } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../env";
import { IDENTITY_HEADERS, IdentityHeader } from "./identity-headers";
import { AUTH_API_PREFIX, AUTH_SCHEME, PROXY_ERRORS } from "./proxy.constants";

export function stripIncomingIdentityHeaders(request: FastifyRequest): void {
  for (const header of IDENTITY_HEADERS) {
    delete request.headers[header];
  }
}

export async function authRoutesStripPreHandler(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  stripIncomingIdentityHeaders(request);
}

export async function boardsIdentityPreHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  stripIncomingIdentityHeaders(request);

  const rawCookie = request.headers.cookie;
  const cookieHeader = Array.isArray(rawCookie) ? rawCookie.join("; ") : rawCookie;

  if (!cookieHeader?.length) {
    reply
      .code(HttpStatus.UNAUTHORIZED)
      .send({ error: PROXY_ERRORS.UNAUTHORIZED });
    return;
  }

  const tokenUrl = new URL(`${AUTH_API_PREFIX}/token`, env.IDENTITY_SERVICE_URL);
  const tokenRes = await fetch(tokenUrl, {
    headers: { cookie: cookieHeader },
  });

  if (tokenRes.status === HttpStatus.UNAUTHORIZED) {
    reply
      .code(HttpStatus.UNAUTHORIZED)
      .send({ error: PROXY_ERRORS.UNAUTHORIZED });
    return;
  }

  if (!tokenRes.ok) {
    reply
      .code(HttpStatus.INTERNAL_SERVER_ERROR)
      .send({ error: PROXY_ERRORS.TOKEN_MINT_FAILED });
    return;
  }

  const body = (await tokenRes.json()) as { token?: string };
  if (!body?.token) {
    reply
      .code(HttpStatus.INTERNAL_SERVER_ERROR)
      .send({ error: PROXY_ERRORS.TOKEN_MINT_FAILED });
    return;
  }

  request.headers[IdentityHeader.Authorization] =
    `${AUTH_SCHEME} ${body.token}`;
}
