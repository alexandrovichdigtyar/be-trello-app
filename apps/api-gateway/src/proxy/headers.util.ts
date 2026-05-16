import type { IncomingHttpHeaders } from "http";

export function toFetchHeaders(input: IncomingHttpHeaders): Headers {
  const out = new Headers();
  for (const [name, value] of Object.entries(input)) {
    if (typeof value === "string") {
      out.set(name, value);
    } else if (Array.isArray(value)) {
      for (const v of value) {
        out.append(name, v);
      }
    }
  }
  return out;
}
