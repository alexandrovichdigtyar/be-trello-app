export const BOARDS_PROXY = {
  prefix: "/boards",
  rewritePrefix: "/boards",
} as const;

export const AUTH_API_PREFIX = "/api/auth";

export const ME_PROXY = {
  prefix: "/me",
  rewritePrefix: "/me",
} as const;

export const AUTH_SCHEME = "Bearer";

export const PROXY_ERRORS = {
  UNAUTHORIZED: "Unauthorized",
  TOKEN_MINT_FAILED: "Failed to mint identity token",
} as const;
