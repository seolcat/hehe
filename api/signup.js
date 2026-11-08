// 회원가입: 아이디 중복 확인 → 비밀번호 암호화 저장 → 로그인 토큰 발급
const { rest } = require("./_sb");
const { crypto, scrypt, USER_RE, newSession } = require("./_auth");
const enc = encodeURIComponent;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const b = req.body || {};
    const username = String(b.username || "").trim().toLowerCase();
    const password = typeof b.password === "string" ? b.password : "";
    if (!USER_RE.test(username)) return res.status(400).json({ message: "아이디는 영문 소문자, 숫자, _ 로 4~20자로 만들어주세요." });
    if (password.length < 8 || password.length > 100) return res.status(400).json({ message: "비밀번호는 8자 이상으로 만들어주세요." });

    const ex = await rest(`users?username=eq.${enc(username)}&select=id`);
    if (ex && ex.length) return res.status(409).json({ error: "duplicate" });

    const id = "u" + Date.now().toString(36) + crypto.randomBytes(5).toString("hex");
    const salt = crypto.randomBytes(16);
    const hash = await scrypt(password, salt);
    try {
      await rest("users", { method: "POST", prefer: "return=minimal", body: { id, username, salt: salt.toString("hex"), hash: hash.toString("hex"), ts: Date.now() } });
    } catch (e) {
      if (/23505|duplicate|409/i.test(String(e.message))) return res.status(409).json({ error: "duplicate" });
      throw e;
    }

    // 로그인 도입 전에 이 기기에서 쓰던 방/영상/반응/메시지를 새 계정으로 옮겨요 (한 번만)
    const old = String(b.legacy || "");
    if (/^u[\w-]{5,40}$/.test(old) && old !== id) {
      try {
        await rest("legacy_claims", { method: "POST", prefer: "return=minimal", body: { old_uid: old, uid: id } });
        for (const [t, col] of [["posts", "uid"], ["members", "uid"], ["reactions", "uid"], ["messages", "uid"], ["rooms", "owner"]]) {
          await rest(`${t}?${col}=eq.${enc(old)}`, { method: "PATCH", prefer: "return=minimal", body: { [col]: id } }).catch(() => {});
        }
      } catch (e) { /* 이미 옮긴 기록이면 건너뜀 */ }
    }

    const token = await newSession(rest, id);
    res.status(200).json({ uid: id, token });
  } catch (e) {
    res.status(500).json({ message: "서버 오류: " + String(e.message || e).slice(0, 120) });
  }
};
