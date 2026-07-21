import "server-only";

/**
 * Shared eBay OAuth plumbing for the two token endpoints.
 *
 * These exist because torkay.com hosts the registered redirect URI for
 * Torrin's eBay Developer application (used by RideRadar). They are not part
 * of the site; they are an integration surface that happens to live on this
 * domain, and they must keep their exact paths — see docs/TECH-SPEC.md §6.
 */

export const ebayApiBase = () =>
  process.env.EBAY_ENV === "SANDBOX"
    ? "https://api.sandbox.ebay.com"
    : "https://api.ebay.com";

/** Basic auth header from the app credentials, or null if unconfigured. */
export function ebayBasicAuth(): string | null {
  const id = process.env.EBAY_CLIENT_ID;
  const secret = process.env.EBAY_CLIENT_SECRET;
  if (!id || !secret) return null;
  return Buffer.from(`${id}:${secret}`).toString("base64");
}

export async function requestEbayToken(
  body: Record<string, string>,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const auth = ebayBasicAuth();
  if (!auth) {
    return { ok: false, status: 503, data: { error: "eBay credentials not configured" } };
  }

  const response = await fetch(`${ebayApiBase()}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
    cache: "no-store",
  });

  return { ok: response.ok, status: response.status, data: await response.json() };
}

/**
 * Constant-time comparison of a caller-supplied secret against the configured
 * one. `===` on a secret leaks its prefix through timing; this does not.
 * Returns false when unconfigured, so the endpoint fails closed.
 */
export function isAuthorized(header: string | null): boolean {
  const expected = process.env.EBAY_PROXY_SECRET;
  if (!expected || !header) return false;

  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
