// ─── FLOWICS API (all calls via Vite proxy to avoid CORS) ─────────────────────
// /api/push/*    → discover.flowics.com/*
// /api/flowics/* → api.flowics.com/*

const FlowicsAPI = {
  // ─── HTTP PUSH ──────────────────────────────────────────────────────────────
  async httpPush(proxyPath, bearerToken, data) {
    const res = await fetch(proxyPath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }
    if (res.status === 204 || res.status === 202) return { ok: true };
    return res.json().catch(() => ({ ok: true }));
  },

  // ─── CONTROL API ────────────────────────────────────────────────────────────

  /** List all overlays with state + controls (includes current text values) */
  async listOverlays(token) {
    const res = await fetch(`/api/flowics/graphics/${token}/control/overlays`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  },

  /** Transition overlay IN/OUT */
  async transition(token, overlayId, direction) {
    const res = await fetch(`/api/flowics/graphics/${token}/control/overlays/transition`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ id: overlayId, transition: direction }]),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    if (res.status === 204 || res.status === 202) return { ok: true };
    return res.json().catch(() => ({ ok: true }));
  },

  /** All overlays OUT */
  async allOut(token) {
    const res = await fetch(`/api/flowics/graphics/${token}/control/overlays/all-out`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    if (res.status === 204 || res.status === 202) return { ok: true };
    return res.json().catch(() => ({ ok: true }));
  },
};

export default FlowicsAPI;
