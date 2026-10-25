module.exports = (req, res) => {
  const raw = (process.env.project_URL_ID || "").trim().replace(/\/+$/, "");
  const url = raw.startsWith("http") ? raw : raw ? `https://${raw}.supabase.co` : "";
  const key = (process.env.API_key || "").trim();
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ url, key });
};
 
