import tls from 'node:tls';
import { safeLookup } from './ssrf.js';

export interface TlsInfo {
  authorized: boolean;
  authorizationError?: string;
  /** e.g. "TLSv1.3" */
  protocol: string | null;
  validTo?: Date;
  daysRemaining?: number;
  issuer?: string;
}

/** Opens a TLS connection and reads certificate + protocol details. Returns null if TLS is unavailable. */
export function getTlsInfo(
  hostname: string,
  port = 443,
  timeoutMs = 8_000,
): Promise<TlsInfo | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: TlsInfo | null) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    };

    const socket = tls.connect({
      host: hostname,
      port,
      servername: hostname,
      rejectUnauthorized: false,
      lookup: safeLookup,
      timeout: timeoutMs,
    });

    socket.once('secureConnect', () => {
      const cert = socket.getPeerCertificate();
      const validTo = cert?.valid_to ? new Date(cert.valid_to) : undefined;
      const issuer = cert?.issuer?.O ?? cert?.issuer?.CN;
      finish({
        authorized: socket.authorized,
        authorizationError: socket.authorizationError
          ? String(socket.authorizationError)
          : undefined,
        protocol: socket.getProtocol(),
        validTo,
        daysRemaining: validTo
          ? Math.floor((validTo.getTime() - Date.now()) / 86_400_000)
          : undefined,
        issuer: Array.isArray(issuer) ? issuer[0] : issuer,
      });
    });
    socket.once('error', () => finish(null));
    socket.once('timeout', () => finish(null));
  });
}
