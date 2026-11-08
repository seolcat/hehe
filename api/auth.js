// 서버 전용: 비밀번호 암호화(해시)와 로그인 세션 도우미
const crypto = require("crypto");
const scrypt = (pw, salt) => new Promise((ok, no) => crypto.scrypt(pw, salt, 64, (e, k) => (e ? no(e) : ok(k))));
const sha = t => crypto.createHash("sha256").update(t).digest("hex");
const USER_RE = /^[a-z0-9_]{4,20}$/;

async function newSession(rest, uid) {
  const token = crypto.randomBytes(32).toString("hex");
  await rest("sessions", { method: "POST", prefer: "return=minimal", body: { token_hash: sha(token), uid, exp: Date.now() + 90 * 86400000 } });
  return token;
}
module.exports = { crypto, scrypt, sha, USER_RE, newSession };
