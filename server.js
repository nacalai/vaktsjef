import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 80;
const SETTINGS_FILE = "/data/settings.json";

// ─── VERSION ──────────────────────────────────────────────────────────────────
const BUILD_TIME = new Date().toISOString();
app.get("/api/version", (req, res) => res.json({ v: "1.1.0", built: BUILD_TIME }));

// ─── SETTINGS API ─────────────────────────────────────────────────────────────
app.get("/api/settings", (req, res) => {
  if (existsSync(SETTINGS_FILE)) {
    try {
      const data = JSON.parse(readFileSync(SETTINGS_FILE, "utf-8"));
      return res.json(data);
    } catch { /* fall through */ }
  }
  res.json({});
});

app.put("/api/settings", express.json(), (req, res) => {
  try {
    writeFileSync(SETTINGS_FILE, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PROXY: HTTP Push → discover.flowics.com ──────────────────────────────────
app.use("/api/push", createProxyMiddleware({
  target: "https://discover.flowics.com",
  changeOrigin: true,
  pathRewrite: { "^/api/push": "" },
  secure: true,
}));

// ─── PROXY: Control API → api.flowics.com ─────────────────────────────────────
app.use("/api/flowics", createProxyMiddleware({
  target: "https://api.flowics.com",
  changeOrigin: true,
  pathRewrite: { "^/api/flowics": "" },
  secure: true,
}));

// ─── STATIC FILES ─────────────────────────────────────────────────────────────
app.use(express.static(join(__dirname, "dist")));
app.get("/{*splat}", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => console.log(`Vaktsjef running on :${PORT}`));
