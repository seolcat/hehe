const { rest } = require("./_sb");
const enc = encodeURIComponent;
 
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { sub, uid, rooms, off } = req.body || {};
    const ep = sub && sub.endpoint;
    if (!ep || !String(ep).startsWith("https://") || !sub.keys || typeof uid !== "string" || !uid) return res.status(400).json({ error: "bad request" });
    const list = (Array.isArray(rooms) ? rooms : []).filter(r => typeof r === "string" && /^[\w-]{1,64}$/.test(r)).slice(0, 50);
 
    if (off || !list.length) {
      await rest(`push_subs?endpoint=eq.${enc(ep)}`, { method: "DELETE" });
      return res.status(200).json({ ok: true, rooms: 0 });
    }
    await rest(`push_subs?endpoint=eq.${enc(ep)}&room_id=not.in.(${list.join(",")})`, { method: "DELETE" });
    await rest("push_subs?on_conflict=endpoint,room_id", {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=minimal",
      body: list.map(r => ({ endpoint: ep, room_id: r, uid, sub, ts: Date.now() }))
    });
    res.status(200).json({ ok: true, rooms: list.length });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
