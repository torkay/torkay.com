import { isAuthorized, requestEbayToken } from "@/lib/ebay";

export const dynamic = "force-dynamic";

/**
 * eBay application token (client_credentials, Browse API read scope).
 *
 * ⚠ BEHAVIOUR CHANGE FROM v1 — DELIBERATE.
 *
 * The v1 handler was an unauthenticated public endpoint that minted a valid
 * eBay application token and returned it to any caller. Anyone who found the
 * URL could take a token issued against Torrin's developer credentials, spend
 * his API quota, and make Browse calls as his application. Porting that
 * faithfully would have carried a live vulnerability onto the new site.
 *
 * This version requires `x-proxy-secret` to match `EBAY_PROXY_SECRET`, and
 * **fails closed**: with no secret configured it returns 503 rather than
 * falling back to the open behaviour. If the caller (RideRadar) breaks after
 * deploy, the fix is to set the shared secret at both ends — not to remove
 * this check.
 *
 * See docs/DECISIONS.md ADR-004.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request.headers.get("x-proxy-secret"))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { ok, status, data } = await requestEbayToken({
      grant_type: "client_credentials",
      scope: "https://api.ebay.com/oauth/api_scope",
    });
    return Response.json(data, { status: ok ? 200 : status });
  } catch (error) {
    console.error("app-token: eBay token request failed", error);
    return Response.json({ error: "token request failed" }, { status: 502 });
  }
}
