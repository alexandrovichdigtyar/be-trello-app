import http from 'node:http';
import type { AddressInfo } from 'node:net';

export type EchoRequestRecord = {
  method: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  body: Buffer;
};

export type EchoServer = {
  url: string;
  requests: EchoRequestRecord[];
  close: () => Promise<void>;
};

export function createEchoServer(): Promise<EchoServer> {
  const requests: EchoRequestRecord[] = [];

  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const chunks: Buffer[] = [];

      req.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      req.on('end', () => {
        const body = Buffer.concat(chunks);
        requests.push({
          method: req.method ?? 'GET',
          path: req.url ?? '/',
          headers: req.headers,
          body,
        });

        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(
          JSON.stringify({
            method: req.method,
            path: req.url,
            bodyBase64: body.toString('base64'),
            bodyText: body.toString('utf8'),
          }),
        );
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address() as AddressInfo;
      resolve({
        url: `http://127.0.0.1:${address.port}`,
        requests,
        close: () =>
          new Promise((closeResolve, closeReject) => {
            server.close((err) => {
              if (err) closeReject(err);
              else closeResolve();
            });
          }),
      });
    });
  });
}
