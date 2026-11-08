const raw = (process.env.project_URL_ID || "").trim().replace(/\/+$/, "");
const BASE = raw.startsWith("http") ? raw : raw ? `https://${raw}.supabase.co` : "";
const KEY = (process.env.SUPABASE_SECRET_KEY || "").trim();
 
async function rest(path, { method = "GET", body, prefer } = {}) {
  if (!BASE || !KEY) throw new Error("SUPABASE 환경변수가 없어요");
  const headers = { apikey: KEY, "Content-Type": "application/json" };
  if (KEY.startsWith("eyJ")) headers.Authorization = `Bearer ${KEY}`; // 예전 service_role 키
  if (prefer) headers.Prefer = prefer;
  const r = await fetch(`${BASE}/rest/v1/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  if (!r.ok) throw new Error(`supabase ${r.status}: ${t.slice(0, 200)}`);
  try { return t ? JSON.parse(t) : null; } catch (e) { return null; }
}
module.exports = { rest };
 
