// api/ping.js
export default (req, res) => {
  res.status(200).json({ ok: true, ts: Date.now() });
};
