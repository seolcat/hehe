// 내 기기로 테스트 알림을 보내봅니다. (알림 설정이 제대로 됐는지 확인용)
const webpush = require("web-push");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const { sub } = req.body || {};
  if (!sub || !sub.endpoint || !sub.keys) return res.status(400).json({ message: "알림 구독 정보가 없어요" });
  const pub = (process.env.VAPID_PUBLIC_KEY || "").trim(), priv = (process.env.VAPID_PRIVATE_KEY || "").trim();
  if (!pub || !priv) return res.status(500).json({ message: "VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY 환경변수가 없어요" });
  try {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@example.com", pub, priv);
  } catch (e) {
    return res.status(500).json({ message: "VAPID 설정 오류: " + e.message });
  }
  try {
    await webpush.sendNotification(sub, JSON.stringify({ title: "아워로그", body: "테스트 알림이에요 🔔", url: "/" }), { TTL: 60 });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: `전송 실패 (${e.statusCode || ""}) ${String(e.body || e.message || "").slice(0, 120)}` });
  }
};