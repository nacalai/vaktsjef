// ─── GFX DATABASE FROM FATV CSV ───────────────────────────────────────────
// Overlay IDs (n-koder) matcher det som er satt opp i Flowics Graphics Editor.
// Hvert overlay har en "Control API ID" for tekst-felt som må konfigureres i editoren.

const GFX_DATABASE = {
  "Nyhetsvarsel": {
    color: "#EF4444",
    priority: true,
    items: [
      { type: "Varsel", func: "Varsel 01", id: "n685", hasText: true, role: "vaktsjef" },
      { type: "Varsel", func: "Varsel 02", id: "n694", hasText: true, role: "vaktsjef" },
    ],
  },
  "Børsmorgen": {
    color: "#F59E0B",
    items: [
      { type: "Navn", func: "Programleder", id: "n182", hasText: true },
      { type: "Navn", func: "Gjest_01", id: "n309", hasText: true },
      { type: "Navn", func: "Gjest_02", id: "n314", hasText: true },
      { type: "Navn", func: "Gjest_03", id: "n319", hasText: true },
      { type: "Navn", func: "Trygve Hegnar", id: "n324", hasText: false },
      { type: "Navn", func: "Karl Johan Molnes", id: "n331", hasText: false },
      { type: "Tema", func: "Overskrift_01", id: "n239", hasText: true },
      { type: "Tema", func: "Overskrift_02", id: "n247", hasText: true },
      { type: "Tema", func: "Overskrift_03", id: "n255", hasText: true },
      { type: "Tema", func: "Overskrift_04", id: "n263", hasText: true },
      { type: "Tema", func: "Overskrift_05", id: "n424", hasText: true },
      { type: "Tema", func: "Overskrift_06", id: "n432", hasText: true },
    ],
  },
  "Økonominyhetene": {
    color: "#3B82F6",
    items: [
      { type: "Tema", func: "Overskrift_01", id: "n153", hasText: true },
      { type: "Tema", func: "Overskrift_02", id: "n200", hasText: true },
      { type: "Tema", func: "Overskrift_03", id: "n208", hasText: true },
      { type: "Tema", func: "Overskrift_04", id: "n440", hasText: true },
      { type: "Tema", func: "Overskrift_05", id: "n448", hasText: true },
      { type: "Tema", func: "Overskrift_06", id: "n216", hasText: true },
    ],
  },
  "FinansForum": {
    color: "#8B5CF6",
    items: [
      { type: "Tema", func: "Overskrift_01", id: "n1037", hasText: true },
      { type: "Tema", func: "Overskrift_02", id: "n1045", hasText: true },
      { type: "Tema", func: "Overskrift_03", id: "n1053", hasText: true },
      { type: "Tema", func: "Overskrift_04", id: "n1061", hasText: true },
      { type: "Tema", func: "Overskrift_05", id: "n1069", hasText: true },
      { type: "Tema", func: "Overskrift_06", id: "n1077", hasText: true },
      { type: "Navn", func: "Programleder", id: "n1085", hasText: true },
      { type: "Navn", func: "Gjest_01", id: "n1090", hasText: true },
      { type: "Navn", func: "Gjest_02", id: "n1095", hasText: true },
      { type: "Navn", func: "Gjest_03", id: "n1100", hasText: true },
    ],
  },
  "Siste Nytt - BM": {
    color: "#F97316",
    items: [
      { type: "Tema", func: "Tema 01", id: "n747", hasText: true, role: "vaktsjef" },
      { type: "Tema", func: "Tema 02", id: "n758", hasText: true, role: "vaktsjef" },
      { type: "Siste nytt", func: "Siste nytt", id: "n702", hasText: false },
    ],
  },
  "Siste Nytt - ØN": {
    color: "#06B6D4",
    items: [
      { type: "Tema", func: "Tema 01", id: "n724", hasText: true, role: "vaktsjef" },
      { type: "Tema", func: "Tema 02", id: "n736", hasText: true, role: "vaktsjef" },
      { type: "Siste nytt", func: "Siste nytt", id: "n713", hasText: false },
    ],
  },
  "Sitat / Overskrift": {
    color: "#EC4899",
    items: [
      { type: "Sitat", func: "Sitat_01", id: "n795", hasText: true, role: "vaktsjef" },
      { type: "Sitat", func: "Sitat_02", id: "n805", hasText: true, role: "vaktsjef" },
      { type: "Sitat", func: "Sitat_03 (siste nytt)", id: "n876", hasText: true, role: "vaktsjef" },
    ],
  },
  "Faktaboks": {
    color: "#14B8A6",
    items: [
      { type: "Faktaboks", func: "Skyskraper", id: "n770", hasText: true, role: "vaktsjef" },
      { type: "Faktaboks", func: "Stor", id: "N650", hasText: true },
    ],
  },
  "Teknisk Analyse": {
    color: "#A855F7",
    items: [
      { type: "Tema", func: "Overskrift_01", id: "n464", hasText: true },
      { type: "TA", func: "Nr.1", id: "n824", hasText: true },
      { type: "TA", func: "Nr.2", id: "n833", hasText: true },
      { type: "TA", func: "Nr.3", id: "n841", hasText: true },
      { type: "TA", func: "Nr.4", id: "n849", hasText: true },
      { type: "TA", func: "Nr.5", id: "n857", hasText: true },
      { type: "TA", func: "Nr.6", id: "n865", hasText: true },
    ],
  },
  "Infografikk": {
    color: "#64748B",
    items: [
      { type: "Info", func: "Klokke/dato", id: "n271", hasText: false },
      { type: "Info", func: "Sted/direkte", id: "n279", hasText: true },
      { type: "Info", func: "Sted/direkte nr2", id: "n395", hasText: true },
      { type: "Info", func: "Sted/direkte nr3", id: "n482", hasText: true },
    ],
  },
  "Børsdata": {
    color: "#10B981",
    items: [
      { type: "Børs", func: "Oslo Børs, USD, EUR, Brent", id: "n628", hasText: false },
      { type: "Børs", func: "Gull, Bitcoin, GBP, SEK", id: "n653", hasText: false },
      { type: "Børs", func: "Oslo Børs vinnere", id: "n885", hasText: false },
      { type: "Børs", func: "Oslo Børs tapere", id: "n937", hasText: false },
      { type: "Børs", func: "Mest omsatte", id: "n980", hasText: false },
      { type: "Børs", func: "Nedtelling 5 min", id: "n516", hasText: false },
    ],
  },
  "Generelt": {
    color: "#78716C",
    items: [
      { type: "Tips oss", func: "E-post", id: "n783", hasText: false },
      { type: "Logo", func: "Bugg/vannmerke", id: "n338", hasText: false },
      { type: "Kreditering", func: "Produsent/teknikk", id: "n346", hasText: false },
      { type: "Kreditering", func: "Teknisk analyse", id: "n594", hasText: false },
    ],
  },
  "Promo / Reklame": {
    color: "#D97706",
    items: [
      { type: "Promo", func: "Podkast - Økonominyhetene", id: "n379", hasText: false },
      { type: "Promo", func: "Podkast - Mil etter Mil", id: "n385", hasText: false },
      { type: "Promo", func: "Podkast - Morgenkaffen", id: "n390", hasText: false },
      { type: "Promo", func: "Podkast - Aksjepodden", id: "n456", hasText: false },
      { type: "Reklame", func: "Trygve møter Trygve", id: "n477", hasText: false },
    ],
  },
  "FA Brand Studio / IR": {
    color: "#0EA5E9",
    items: [
      { type: "Tema IR", func: "Overskrift_01", id: "n498", hasText: true },
      { type: "Tema IR", func: "Overskrift_02", id: "n578", hasText: true },
      { type: "Tema BS", func: "Overskrift_01", id: "n1105", hasText: true },
      { type: "Tema BS", func: "Overskrift_02", id: "n1114", hasText: true },
      { type: "Navn", func: "Programleder", id: "n505", hasText: true },
      { type: "Navn", func: "Gjest_01", id: "n510", hasText: true },
      { type: "Merke", func: "Annonsørinnhold", id: "n586", hasText: false },
    ],
  },
  "FA Direkte": {
    color: "#6366F1",
    items: [
      { type: "Skyskraper", func: "Reklame_01", id: "n20", hasText: false },
      { type: "Skyskraper", func: "Reklame_02", id: "n27", hasText: false },
      { type: "Skyskraper", func: "Reklame_03", id: "n32", hasText: false },
      { type: "Skyskraper", func: "Reklame_04", id: "n107", hasText: false },
      { type: "Skyskraper", func: "Reklame_05", id: "n112", hasText: false },
      { type: "PK", func: "PK - 01", id: "n65", hasText: true },
      { type: "PK", func: "PK - 02", id: "n264", hasText: true },
      { type: "Info", func: "Info børsfelt", id: "n291", hasText: true },
      { type: "Siste nytt", func: "Nyhetsvarsel", id: "n431", hasText: true },
      { type: "Siste nytt", func: "Tema", id: "n439", hasText: true },
      { type: "Logo", func: "FA-logo", id: "n473", hasText: false },
    ],
  },
};

export default GFX_DATABASE;
