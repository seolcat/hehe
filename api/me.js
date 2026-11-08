// 저장된 로그인 토큰이 아직 유효한지 확인 / 로그아웃
const { rest } = require("./_sb");
const { sha } = require("./_auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { token, logout } = req.body || {};
    if (typeof token !== "string" || !/^[0-9a-f]{64}$/.test(token)) return res.status(401).json({ error: "invalid" });
    const h = sha(token);
    if (logout) {
      await rest(`sessions?token_hash=eq.${h}`, { method: "DELETE" });
      return res.status(200).json({ ok: true });
    }
    const rows = await rest(`sessions?token_hash=eq.${h}&select=uid,exp`);
    const s = rows && rows[0];
    if (!s || Number(s.exp) < Date.now()) return res.status(401).json({ error: "invalid" });
    res.status(200).json({ uid: s.uid });
  } catch (e) {
    res.status(500).json({ message: "서버 오류: " + String(e.message || e).slice(0, 120) });
  }
};
