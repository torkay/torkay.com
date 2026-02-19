export default async function handler(req, res) {
  try {
    const base = process.env.EBAY_ENV === 'SANDBOX'
      ? 'https://api.sandbox.ebay.com'
      : 'https://api.ebay.com';

    const auth = Buffer
      .from(`${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`)
      .toString('base64');

    // Scope for Browse API read access
    const scope = 'https://api.ebay.com/oauth/api_scope';

    const r = await fetch(`${base}/identity/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope
      })
    });

    const data = await r.json();
    res.status(r.ok ? 200 : 500).json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
