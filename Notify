// 새 영상/메시지가 올라오면 같은 방의 다른 멤버에게 알림을 보냅니다.
const webpush = require("web-push");
const { rest } = require("./_sb");
const enc = encodeURIComponent;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { type, id } = req.body || {};
    if (!["post", "msg"].includes(type) || id === undefined || id === "") return res.status(400).json({ error: "bad request" });
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return res.status(500).json({ error: "VAPID 키가 없어요" });
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@example.com", process.env.VAPID_PUBLIC_KEY.trim(), process.env.VAPID_PRIVATE_KEY.trim());

    // 같은 글에 대해 알림은 딱 한 번만 (notified를 false→true로 바꾼 요청만 통과)
    const table = type === "post" ? "posts" : "messages";
    const rows = await rest(`${table}?id=eq.${enc(id)}&notified=eq.false`, { method: "PATCH", body: { notified: true }, prefer: "return=representation" });
    if (!rows || !rows.length) return res.status(200).json({ sent: 0 });
    const row = rows[0];
    if (Date.now() - Number(row.ts) > 5 * 60 * 1000) return res.status(200).json({ sent: 0, reason: "old" });

    const rm = await rest(`rooms?id=eq.${enc(row.room_id)}&select=name`);
    const title = (rm && rm[0] && rm[0].name) || "아워로그";
    const name = row.name || "친구";
    const body = type === "post" ? `${name}님이 로그를 공유했습니다` : `${name}: ${String(row.body || "").slice(0, 120)}`;
    const payload = JSON.stringify({ title, body, room: row.room_id, url: `/?room=${enc(row.room_id)}` });

    const subs = await rest(`push_subs?room_id=eq.${enc(row.room_id)}&uid=neq.${enc(row.uid)}&select=endpoint,sub`);
    let sent = 0;
    await Promise.all((subs || []).map(async s => {
      try { await webpush.sendNotification(s.sub, payload, { TTL: 3600 }); sent++; }
      catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) await rest(`push_subs?endpoint=eq.${enc(s.endpoint)}`, { method: "DELETE" }).catch(() => {});
      }
    }));
    res.status(200).json({ sent });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
