import { requestEbayToken } from "@/lib/ebay";

export const dynamic = "force-dynamic";

/**
 * eBay OAuth redirect URI.
 *
 * This path is registered with eBay against Torrin's developer application.
 * Changing it requires re-registering — see docs/TECH-SPEC.md §6.
 *
 * ⚠ BEHAVIOUR CHANGE FROM v1 — DELIBERATE.
 *
 * The v1 handler rendered the full token exchange response into the HTML
 * body: `<pre>${JSON.stringify(tokens)}</pre>`. That put an access token *and*
 * a refresh token into the rendered page — visible on screen, in the user's
 * scrollback, in any proxy log, and in browser history. A refresh token is
 * long-lived; leaking one is materially worse than leaking an access token.
 *
 * This version exchanges the code and discards the result, returning only
 * whether the exchange succeeded. Nothing sensitive reaches the browser.
 *
 * Storage is deliberately still not implemented — the v1 comment read "Later:
 * store securely (DB/Secrets)" and that remains the correct next step. What
 * changed is that failing to store no longer means printing.
 */
function page(title: string, body: string, status: number) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<title>${title}</title>` +
      `<style>body{font-family:ui-sans-serif,system-ui,sans-serif;max-width:34rem;` +
      `margin:20vh auto;padding:0 1.5rem;color:#111827;line-height:1.5}` +
      `h1{font-size:1.25rem;margin:0 0 .5rem}p{color:#6b7280;margin:0}</style>` +
      `</head><body><h1>${title}</h1><p>${body}</p></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");

  if (!code) {
    return page("Missing authorization code", "This URL expects a <code>?code</code> parameter.", 400);
  }

  const redirectUri = process.env.EBAY_REDIRECT_URI;
  if (!redirectUri) {
    console.error("oauth/callback: EBAY_REDIRECT_URI is not set");
    return page("Not configured", "This endpoint is not configured. Nothing was exchanged.", 503);
  }

  try {
    const { ok, status } = await requestEbayToken({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    if (!ok) {
      // Status only. The error body can echo request parameters back.
      console.error(`oauth/callback: eBay rejected the exchange (${status})`);
      return page("Authorization failed", "eBay rejected the exchange. You can close this window.", 502);
    }

    // Tokens intentionally go out of scope here without being logged,
    // rendered, or returned. See the note above.
    return page("Connected", "RideRadar is linked to your eBay account. You can close this window.", 200);
  } catch (error) {
    console.error("oauth/callback: token exchange threw", error);
    return page("Something went wrong", "The exchange could not be completed.", 502);
  }
}
