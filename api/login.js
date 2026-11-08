// 로그인: 아이디/비밀번호 확인 → 로그인 토큰 발급
const { rest } = require("./_sb");
const { crypto, scrypt, USER_RE, newSession } = require("./_auth");
const enc = encodeURIComponent;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const b = req.body || {};
    const username = String(b.username || "").trim().toLowerCase();
    const password = typeof b.password === "string" ? b.password : "";
    let u = null;
    if (USER_RE.test(username) && password.length <= 100) {
      const rows = await rest(`users?username=eq.${enc(username)}&select=id,salt,hash`);
      u = rows && rows[0];
    }
    let ok = false;
    if (u) {
      const h = await scrypt(password, Buffer.from(u.salt, "hex"));
      const stored = Buffer.from(u.hash, "hex");
      ok = h.length === stored.length && crypto.timingSafeEqual(h, stored);
    } else {
      await scrypt(password, Buffer.alloc(16)); // 아이디 존재 여부가 시간으로 드러나지 않게
    }
    if (!ok) {
      await new Promise(r => setTimeout(r, 400));
      return res.status(401).json({ error: "invalid" });
    }
    const token = await newSession(rest, u.id);
    res.status(200).json({ uid: u.id, token });
  } catch (e) {
    res.status(500).json({ message: "서버 오류: " + String(e.message || e).slice(0, 120) });
  }
};
