import { HttpStatus } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { auth } from "../auth";
import { toFetchHeaders } from "./headers.util";
import { IDENTITY_HEADERS, IdentityHeader } from "./identity-headers";
import { AUTH_SCHEME, PROXY_ERRORS } from "./proxy.constants";

export async function identityPreHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  for (const header of IDENTITY_HEADERS) {
    delete request.headers[header];
  }

  const headers = toFetchHeaders(request.headers);

  const session = await auth.api.getSession({ headers });

  if (!session) {
    reply
      .code(HttpStatus.UNAUTHORIZED)
      .send({ error: PROXY_ERRORS.UNAUTHORIZED });
    return;
  }

  const token = await auth.api.getToken({ headers });

  if (!token?.token) {
    reply
      .code(HttpStatus.INTERNAL_SERVER_ERROR)
      .send({ error: PROXY_ERRORS.TOKEN_MINT_FAILED });
    return;
  }

  request.headers[IdentityHeader.Authorization] =
    `${AUTH_SCHEME} ${token.token}`;
}
