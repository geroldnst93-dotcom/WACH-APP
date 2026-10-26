/**
 * Design-Tokens. Dunkles Theme:
 *  - Hintergrund: Nacht-Blau-Schwarz
 *  - Akzent: gedämpftes Kerzen-Amber (Aktionen, Wärme)
 *  - Kennzahlen: Salbeigrün (TST, Effizienz, Fenster)
 */
export const colors = {
  bg: "#0B1020", // Nacht-Blau-Schwarz
  surface: "#141B2E",
  surfaceAlt: "#1C2540",
  border: "#273350",
  text: "#E8ECF5",
  textMuted: "#95A0BC",
  textFaint: "#5E6A88",
  amber: "#E0A458", // Kerzen-Amber (Akzent)
  amberDim: "#A9793C",
  sage: "#9CB89A", // Salbeigrün (Kennzahlen)
  danger: "#CE8686",
  dangerBg: "#2A1A1E",
} as const;

export const space = (n: number): number => n * 4;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export const font = {
  h1: 30,
  h2: 22,
  h3: 18,
  body: 16,
  small: 13,
  metric: 34,
} as const;
