export const dynamic = "force-dynamic";

/** Health check. Preserved from v1 at the same path and shape. */
export function GET() {
  return Response.json({ ok: true, ts: Date.now() });
}
