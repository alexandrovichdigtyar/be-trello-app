import { ProxyRoutePrefixes, PUBLIC_EXACT_PATHS } from '../proxy/proxy.constants';

export function requiresBearerJwt(path: string, method: string): boolean {
  if (method === 'OPTIONS') {
    return false;
  }

  if (PUBLIC_EXACT_PATHS.has(path)) {
    return false;
  }

  if (path.startsWith(ProxyRoutePrefixes.gatewayIdentityAuth)) {
    return false;
  }

  return true;
}
