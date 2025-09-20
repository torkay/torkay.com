function esc(s) { return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing ?code');

  const base = process.env.EBAY_ENV === 'SANDBOX'
    ? 'https://api.sandbox.ebay.com'
    : 'https://api.ebay.com';

  const auth = Buffer
    .from(`${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`)
    .toString('base64');

  const r = await fetch(`${base}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.EBAY_REDIRECT_URI
    })
  });

  const tokens = await r.json();

  // For now, just show the result. Later: store securely (DB/Secrets).
  res.setHeader('Content-Type', 'text/html');
  res.status(r.ok ? 200 : 500).send(
    `<h1>RideRadar × eBay</h1><p>Callback received.</p><pre>${esc(JSON.stringify(tokens, null, 2))}</pre>`
  );
}
