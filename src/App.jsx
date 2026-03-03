import { useState, useRef, useEffect, useCallback } from "react";
import FlowicsAPI from "./flowicsApi";

// ─── SCHEMA ───────────────────────────────────────────────────────────────────
const SCHEMA = {
  nyhetsvarsel_01_headline: "",
  nyhetsvarsel_02_headline: "",
  siste_nytt_bm_tema01_headline: "", siste_nytt_bm_tema01_subline: "",
  siste_nytt_bm_tema02_headline: "", siste_nytt_bm_tema02_subline: "",
  siste_nytt_on_tema01_headline: "", siste_nytt_on_tema01_subline: "",
  siste_nytt_on_tema02_headline: "", siste_nytt_on_tema02_subline: "",
  sitat_01_headline: "", sitat_01_subline: "",
  sitat_02_headline: "", sitat_02_subline: "",
  sitat_03_headline: "", sitat_03_subline: "",
};

const GROUPS = [
  {
    key: "nyhetsvarsel", label: "Nyhetsvarsel",
    items: [
      { key: "nyhetsvarsel_01", label: "Varsel 01", defaultId: "n685",
        fields: [
          { sk: "nyhetsvarsel_01_headline", label: "Overskrift", placeholder: "Nyhetsvarsel...", large: true },
        ] },
      { key: "nyhetsvarsel_02", label: "Varsel 02", defaultId: "n694",
        fields: [
          { sk: "nyhetsvarsel_02_headline", label: "Overskrift", placeholder: "Nyhetsvarsel...", large: true },
        ] },
    ],
  },
  {
    key: "bm", label: "Børsmorgen",
    items: [
      { key: "siste_nytt_bm_tema01", label: "Siste Nytt — Tema 01", defaultId: "n747",
        fields: [
          { sk: "siste_nytt_bm_tema01_headline", label: "Overtittel", placeholder: "Overtittel...", large: true },
          { sk: "siste_nytt_bm_tema01_subline", label: "Undertittel", placeholder: "Undertittel..." },
        ] },
      { key: "siste_nytt_bm_tema02", label: "Siste Nytt — Tema 02", defaultId: "n758",
        fields: [
          { sk: "siste_nytt_bm_tema02_headline", label: "Overtittel", placeholder: "Overtittel...", large: true },
          { sk: "siste_nytt_bm_tema02_subline", label: "Undertittel", placeholder: "Undertittel..." },
        ] },
    ],
  },
  {
    key: "on", label: "Økonominyhetene",
    items: [
      { key: "siste_nytt_on_tema01", label: "Siste Nytt — Tema 01", defaultId: "n724",
        fields: [
          { sk: "siste_nytt_on_tema01_headline", label: "Overtittel", placeholder: "Overtittel...", large: true },
          { sk: "siste_nytt_on_tema01_subline", label: "Undertittel", placeholder: "Undertittel..." },
        ] },
      { key: "siste_nytt_on_tema02", label: "Siste Nytt — Tema 02", defaultId: "n736",
        fields: [
          { sk: "siste_nytt_on_tema02_headline", label: "Overtittel", placeholder: "Overtittel...", large: true },
          { sk: "siste_nytt_on_tema02_subline", label: "Undertittel", placeholder: "Undertittel..." },
        ] },
    ],
  },
  {
    key: "sitat", label: "Sitat",
    items: [
      { key: "sitat_01", label: "Sitat 01", defaultId: "n795",
        fields: [
          { sk: "sitat_01_headline", label: "Sitat", placeholder: "Skriv sitat...", large: true },
          { sk: "sitat_01_subline", label: "Kilde", placeholder: "Kilde..." },
        ] },
      { key: "sitat_02", label: "Sitat 02", defaultId: "n805",
        fields: [
          { sk: "sitat_02_headline", label: "Sitat", placeholder: "Skriv sitat...", large: true },
          { sk: "sitat_02_subline", label: "Kilde", placeholder: "Kilde..." },
        ] },
      { key: "sitat_03", label: "Sitat 03 — Siste nytt", tag: "Nøytral", style: "neutral", defaultId: "n876",
        fields: [
          { sk: "sitat_03_headline", label: "Sitat", placeholder: "Skriv sitat...", large: true },
          { sk: "sitat_03_subline", label: "Kilde", placeholder: "Kilde..." },
        ] },
    ],
  },
];

const DEFAULT_PUSH = {
  proxyPath: "",
  bearer: "",
};

const loadCfg = () => { try { return JSON.parse(localStorage.getItem("fa_vk3") || "null"); } catch { return null; } };
const saveCfg = (c) => {
  localStorage.setItem("fa_vk3", JSON.stringify(c));
  fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) }).catch(() => {});
};
const loadRemoteCfg = () => fetch("/api/settings").then((r) => r.json()).catch(() => null);

export default function App() {
  const cfg = loadCfg();
  const [gfxToken, setGfxToken] = useState(cfg?.gfxToken || "");
  const [gfxInput, setGfxInput] = useState(cfg?.gfxToken || "");
  const [connected, setConnected] = useState(!!cfg?.gfxToken);
  const [pushPath, setPushPath] = useState(cfg?.pushPath || DEFAULT_PUSH.proxyPath);
  const [pushBearer, setPushBearer] = useState(cfg?.pushBearer || DEFAULT_PUSH.bearer);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("nyhetsvarsel");

  // Overlay ID map
  const [idMap, setIdMap] = useState(() => {
    if (cfg?.idMap) return cfg.idMap;
    const m = {};
    GROUPS.forEach((g) => g.items.forEach((it) => { m[it.key] = it.defaultId; }));
    return m;
  });

  // API overlays: [{ id, name, regionName, state, controls }]
  const [apiOverlays, setApiOverlays] = useState([]);
  const [liveStates, setLiveStates] = useState({});
  // Controls values from API: { "nXXX": [{ id, title, value }] }
  const [controlValues, setControlValues] = useState({});
  // Locally tracked last-sent values per item
  const [lastSent, setLastSent] = useState(cfg?.lastSent || {});

  // Per-item UI state
  const [items, setItems] = useState(() => {
    const savedHist = cfg?.history || {};
    const init = {};
    GROUPS.forEach((g) => g.items.forEach((it) => {
      const f = {};
      it.fields.forEach((ff) => { f[ff.sk] = ""; });
      init[it.key] = { fields: f, loading: false, status: null, history: savedHist[it.key] || [] };
    }));
    return init;
  });

  const pollRef = useRef(null);
  const statusTimers = useRef({});

  // Load remote settings on mount (for cross-device sync)
  useEffect(() => {
    if (cfg) return; // local config exists, skip
    loadRemoteCfg().then((remote) => {
      if (!remote || !remote.gfxToken) return;
      setGfxToken(remote.gfxToken);
      setGfxInput(remote.gfxToken);
      setPushPath(remote.pushPath || "");
      setPushBearer(remote.pushBearer || "");
      if (remote.idMap) setIdMap(remote.idMap);
      if (remote.lastSent) setLastSent(remote.lastSent);
      if (remote.history) {
        setItems((prev) => {
          const next = { ...prev };
          Object.entries(remote.history).forEach(([k, h]) => {
            if (next[k]) next[k] = { ...next[k], history: h };
          });
          return next;
        });
      }
      setConnected(true);
      localStorage.setItem("fa_vk3", JSON.stringify(remote));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll server settings for cross-session sync (every 5s)
  const syncRef = useRef(null);
  useEffect(() => {
    if (!connected) return;
    syncRef.current = setInterval(async () => {
      const remote = await loadRemoteCfg();
      if (!remote) return;
      if (remote.lastSent) setLastSent(remote.lastSent);
      if (remote.history) {
        setItems((prev) => {
          const next = { ...prev };
          let changed = false;
          Object.entries(remote.history).forEach(([k, h]) => {
            if (next[k] && JSON.stringify(next[k].history) !== JSON.stringify(h)) {
              next[k] = { ...next[k], history: h };
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      }
    }, 5000);
    return () => clearInterval(syncRef.current);
  }, [connected]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (connected) {
      const history = {};
      Object.entries(items).forEach(([k, v]) => { if (v.history.length) history[k] = v.history; });
      saveCfg({ gfxToken, pushPath, pushBearer, idMap, lastSent, history });
    }
  }, [connected, gfxToken, pushPath, pushBearer, idMap, lastSent, items]);

  // ─── PARSE OVERLAY DATA ──────────────────────────────────────────────────────
  const parseOverlayData = (data) => {
    const states = {};
    const ctrls = {};
    const overlays = data.map((o) => {
      states[o.id] = o.state || "out";
      const regionName = o.region?.name || "";
      const overlayName = (o.name && o.name !== "Overlay") ? o.name : "";
      // Parse controls: extract text values sorted by order
      if (o.controls && Object.keys(o.controls).length > 0) {
        const textCtrls = Object.values(o.controls)
          .filter((c) => c.type === "text" && c.value !== undefined)
          .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
          .map((c) => ({ id: c.id, title: c.title || c.id, value: c.value }));
        if (textCtrls.length > 0) ctrls[o.id] = textCtrls;
      }
      return { id: o.id, name: overlayName, regionName, state: o.state || "out" };
    });
    return { overlays, states, ctrls };
  };

  // ─── FETCH OVERLAYS ─────────────────────────────────────────────────────────
  const fetchOverlays = useCallback(async (token) => {
    try {
      const data = await FlowicsAPI.listOverlays(token || gfxToken);
      if (!Array.isArray(data)) return;
      const { overlays, states, ctrls } = parseOverlayData(data);
      setApiOverlays(overlays);
      setLiveStates(states);
      setControlValues(ctrls);
    } catch (err) { console.warn("Fetch failed:", err.message); }
  }, [gfxToken]);

  const handleConnect = async () => {
    const t = gfxInput.trim();
    if (!t) return;
    setGfxToken(t);
    setConnected(true);
    await fetchOverlays(t);
  };

  // Auto-fetch on mount if already connected
  useEffect(() => {
    if (connected && gfxToken) fetchOverlays(gfxToken);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling (states + controls)
  useEffect(() => {
    if (!connected || !gfxToken) return;
    const poll = async () => {
      try {
        const data = await FlowicsAPI.listOverlays(gfxToken);
        if (!Array.isArray(data)) return;
        const { states, ctrls } = parseOverlayData(data);
        setLiveStates(states);
        setControlValues(ctrls);
      } catch (_) {}
    };
    pollRef.current = setInterval(poll, 3000);
    return () => clearInterval(pollRef.current);
  }, [connected, gfxToken]);

  // ─── HELPERS ────────────────────────────────────────────────────────────────
  const updateField = (ik, sk, val) => {
    setItems((p) => ({ ...p, [ik]: { ...p[ik], fields: { ...p[ik].fields, [sk]: val } } }));
  };
  const clearStatus = (ik, ms = 5000) => {
    if (statusTimers.current[ik]) clearTimeout(statusTimers.current[ik]);
    statusTimers.current[ik] = setTimeout(() => {
      setItems((p) => ({ ...p, [ik]: { ...p[ik], status: null } }));
    }, ms);
  };

  // Build dropdown label — show control values if available
  const overlayLabel = (o) => {
    let lbl = o.id;
    if (o.name) lbl += ` — ${o.name}`;
    if (o.regionName) lbl += ` [${o.regionName}]`;
    const ctrls = controlValues[o.id];
    if (ctrls && ctrls.length > 0) {
      const preview = ctrls.map((c) => c.value).filter(Boolean).join(' / ');
      if (preview) lbl += ` │ ${preview.slice(0, 40)}`;
    }
    return lbl;
  };

  // ─── SEND ───────────────────────────────────────────────────────────────────
  const send = async (itemDef, goLive) => {
    const ik = itemDef.key;
    const is = items[ik];
    if (!is || !Object.values(is.fields).some((v) => v.trim())) return;
    const overlayId = idMap[ik];
    if (goLive && !overlayId) {
      setItems((p) => ({ ...p, [ik]: { ...p[ik], status: { t: "error", m: "Ingen n-kode satt" } } }));
      clearStatus(ik); return;
    }
    setItems((p) => ({ ...p, [ik]: { ...p[ik], loading: true, status: null } }));
    try {
      // Build payload: start with SCHEMA, merge all last-sent values, then apply current item
      const payload = { ...SCHEMA };
      Object.values(lastSent).forEach((sent) => {
        Object.entries(sent).forEach(([k, v]) => { if (k in payload) payload[k] = v; });
      });
      itemDef.fields.forEach((f) => { payload[f.sk] = (is.fields[f.sk] || "").trim(); });
      await FlowicsAPI.httpPush(pushPath, pushBearer, payload);

      if (goLive && gfxToken && overlayId) {
        // Show status while waiting for Flowics to process pushed text
        setItems((p) => ({ ...p, [ik]: { ...p[ik], status: { t: "info", m: "Tekst pushet, venter på Flowics..." } } }));
        // Wait for Flowics to apply the push data to the output renderer
        await new Promise((r) => setTimeout(r, 3000));
        await FlowicsAPI.transition(gfxToken, overlayId, "in");
        setLiveStates((p) => ({ ...p, [overlayId]: "in" }));
      }

      // Track last-sent values locally
      const sentVals = {};
      itemDef.fields.forEach((f) => { sentVals[f.sk] = (is.fields[f.sk] || "").trim(); });
      setLastSent((p) => ({ ...p, [ik]: { ...sentVals, time: new Date().toLocaleTimeString("no-NO") } }));

      const entry = { ...sentVals, time: new Date().toLocaleTimeString("no-NO"), wentIn: goLive };
      const cleared = {};
      itemDef.fields.forEach((f) => { cleared[f.sk] = ""; });

      setItems((p) => ({
        ...p,
        [ik]: {
          ...p[ik], loading: false,
          status: { t: "ok", m: goLive ? "Sendt + på lufta ✓" : "Tekst oppdatert ✓" },
          history: [entry, ...p[ik].history.slice(0, 7)],
          fields: goLive ? cleared : p[ik].fields,
        },
      }));
      clearStatus(ik);
    } catch (err) {
      setItems((p) => ({ ...p, [ik]: { ...p[ik], loading: false, status: { t: "error", m: err.message } } }));
      clearStatus(ik, 8000);
    }
  };

  const takeOut = async (ik) => {
    const overlayId = idMap[ik];
    if (!gfxToken || !overlayId) return;
    try {
      await FlowicsAPI.transition(gfxToken, overlayId, "out");
      setLiveStates((p) => ({ ...p, [overlayId]: "out" }));
      setItems((p) => ({ ...p, [ik]: { ...p[ik], status: { t: "info", m: "Tatt av lufta" } } }));
      clearStatus(ik);
    } catch (err) {
      setItems((p) => ({ ...p, [ik]: { ...p[ik], status: { t: "error", m: err.message } } }));
    }
  };

  const allOut = async () => {
    if (!gfxToken) return;
    try { await FlowicsAPI.allOut(gfxToken); setLiveStates({}); } catch (_) {}
  };

  const recall = (itemDef, entry) => {
    const f = {};
    itemDef.fields.forEach((ff) => { f[ff.sk] = entry[ff.sk] || ""; });
    setItems((p) => ({ ...p, [itemDef.key]: { ...p[itemDef.key], fields: f } }));
  };

  const anyLive = Object.values(liveStates).some((s) => s === "in");
  const activeGroup = GROUPS.find((g) => g.key === activeTab);

  // ─── CONNECT ────────────────────────────────────────────────────────────────
  if (!connected) {
    return (
      <div className="vk">
        <div className="vk-connect">
          <div className="vk-brand">Finansavisen</div>
          <div className="vk-brand-rule" />
          <div className="vk-brand-sub">VAKTSJEF</div>
          <p className="vk-brand-desc">Grafikkontroll · Flowics</p>
          <div className="vk-connect-row">
            <input type="password" value={gfxInput}
              onChange={(e) => setGfxInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              placeholder="Flowics Graphics Token..."
              className="vk-connect-input" autoFocus />
            <button onClick={handleConnect} disabled={!gfxInput.trim()} className="vk-connect-go">
              Koble til
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN ───────────────────────────────────────────────────────────────────
  return (
    <div className="vk">
      {/* TOP BAR */}
      <header className="vk-top">
        <div className="vk-top-left">
          <span className="vk-top-logo">Finansavisen</span>
          <span className="vk-top-sep" />
          <span className="vk-top-label">VAKTSJEF</span>
          {anyLive && <span className="vk-top-live"><span className="vk-dot" /> LIVE</span>}
        </div>
        <div className="vk-top-right">
          {anyLive && <button className="vk-allout" onClick={allOut}>Alt av lufta</button>}
          <button className="vk-icon-btn" onClick={() => fetchOverlays()} title="Hent overlays">↻</button>
          <button className={`vk-icon-btn ${showSettings ? "on" : ""}`}
            onClick={() => setShowSettings(!showSettings)}>⚙</button>
        </div>
      </header>

      {/* SETTINGS */}
      {showSettings && (
        <div className="vk-cfg">
          <div className="vk-cfg-cols">
            <div>
              <h4>Tilkobling</h4>
              <label>Graphics Token</label>
              <div className="vk-cfg-row">
                <input type="password" value={gfxToken} readOnly className="vk-cfg-in" />
                <button className="vk-cfg-disc" onClick={() => {
                  setConnected(false); localStorage.removeItem("fa_vk3");
                }}>Koble fra</button>
              </div>
              <label>Push Endpoint</label>
              <input value={pushPath} onChange={(e) => setPushPath(e.target.value)} className="vk-cfg-in vk-cfg-mono" />
              <label>Push Bearer</label>
              <input type="password" value={pushBearer} onChange={(e) => setPushBearer(e.target.value)} className="vk-cfg-in" />
            </div>
            <div>
              <h4>Overlays ({apiOverlays.length})</h4>
              <div className="vk-cfg-tags">
                {apiOverlays.slice(0, 30).map((o) => (
                  <span key={o.id} className={`vk-cfg-tag ${liveStates[o.id] === "in" ? "live" : ""}`}>
                    {o.id}{o.name ? ` ${o.name}` : ""}<span className="vk-cfg-tag-r">{o.regionName}</span>
                  </span>
                ))}
                {apiOverlays.length > 30 && <span className="vk-cfg-more">+{apiOverlays.length - 30} til</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <nav className="vk-tabs">
        {GROUPS.map((g) => {
          const hasLive = g.items.some((it) => liveStates[idMap[it.key]] === "in");
          return (
            <button key={g.key} onClick={() => setActiveTab(g.key)}
              className={`vk-tab ${activeTab === g.key ? "on" : ""}`}>
              {hasLive && <span className="vk-dot" />}
              {g.label}
            </button>
          );
        })}
      </nav>

      {/* ITEMS */}
      {activeGroup && (
        <div className="vk-items">
          {activeGroup.items.map((itemDef) => {
            const ik = itemDef.key;
            const is = items[ik];
            if (!is) return null;
            const oid = idMap[ik] || "";
            const isLive = liveStates[oid] === "in";
            const hasText = Object.values(is.fields).some((v) => v.trim());
            const sent = lastSent[ik];

            return (
              <div key={ik} className={`vk-card ${isLive ? "live" : ""} ${itemDef.style === "neutral" ? "neutral" : ""}`}>
                {/* HEADER */}
                <div className="vk-card-head">
                  <div className="vk-card-left">
                    {isLive && <span className="vk-dot" />}
                    <span className="vk-card-label">{itemDef.label}</span>
                    {itemDef.tag && <span className={`vk-tag ${itemDef.style === "neutral" ? "vk-tag-neutral" : ""}`}>{itemDef.tag}</span>}
                    {isLive && <span className="vk-air-badge">PÅ LUFTA</span>}
                  </div>
                  <div className="vk-card-id">
                    <input type="text" value={oid}
                      onChange={(e) => setIdMap((p) => ({ ...p, [ik]: e.target.value }))}
                      className="vk-ncode" placeholder="nXXX" spellCheck={false} />
                    <select className="vk-npick" value={oid}
                      onChange={(e) => setIdMap((p) => ({ ...p, [ik]: e.target.value }))}>
                      <option value={oid}>{oid || "Velg overlay..."}</option>
                      {apiOverlays.filter((o) => o.id !== oid).map((o) => (
                        <option key={o.id} value={o.id}>{overlayLabel(o)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CURRENT VALUES: only show API controls (from Flowics Integration IDs) */}
                {(() => {
                  const apiCtrls = oid ? controlValues[oid] : null;
                  if (apiCtrls && apiCtrls.length > 0) {
                    return (
                      <div className="vk-current vk-current-api">
                        <span className="vk-current-src">Flowics</span>
                        {apiCtrls.map((c) => (
                          <div key={c.id} className="vk-current-item">
                            <span className="vk-current-key">{c.title}</span>
                            <span className="vk-current-val">{c.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* FIELDS */}
                <div className="vk-fields">
                  {itemDef.fields.map((f) => (
                    <div key={f.sk} className="vk-field">
                      <label className="vk-field-lbl">{f.label}</label>
                      <input type="text"
                        value={is.fields[f.sk] || ""}
                        onChange={(e) => updateField(ik, f.sk, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send(itemDef, true);
                          else if (e.key === "Enter") send(itemDef, false);
                        }}
                        placeholder={f.placeholder}
                        className={f.large ? "vk-input vk-input-lg" : "vk-input"} />
                    </div>
                  ))}
                </div>

                {/* BUTTONS */}
                <div className="vk-btns">
                  <button onClick={() => send(itemDef, true)}
                    disabled={is.loading || !hasText || !oid}
                    className="vk-btn vk-btn-live">
                    {is.loading ? "Sender…" : "⏵ Send på lufta"}
                  </button>
                  <button onClick={() => send(itemDef, false)}
                    disabled={is.loading || !hasText}
                    className="vk-btn vk-btn-push">
                    Oppdater tekst
                  </button>
                  <button onClick={() => takeOut(ik)}
                    disabled={!isLive}
                    className={`vk-btn ${isLive ? "vk-btn-off-live" : "vk-btn-off"}`}>
                    ⏹ Ta av
                  </button>
                </div>

                {/* STATUS */}
                {is.status && <div className={`vk-msg vk-msg-${is.status.t}`}>{is.status.m}</div>}

                {/* HISTORY */}
                {is.history.length > 0 && (
                  <div className="vk-hist">
                    {is.history.map((e, i) => (
                      <button key={i} className="vk-hist-row" onClick={() => recall(itemDef, e)}>
                        <span className="vk-hist-t">{e.time}</span>
                        <span className="vk-hist-v">{e[itemDef.fields[0].sk]}</span>
                        {e.wentIn && i === 0 && isLive && <span className="vk-hist-badge">PÅ LUFTA</span>}
                        {e.wentIn && !(i === 0 && isLive) && <span className="vk-hist-badge off">SENDT</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <footer className="vk-foot">
        Enter = oppdater tekst · Ctrl+Enter = send på lufta · {apiOverlays.length} overlays tilgjengelig
      </footer>
    </div>
  );
}
