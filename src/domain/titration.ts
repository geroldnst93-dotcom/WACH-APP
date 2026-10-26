/**
 * Schlaf-Restriktions-Titration (CBT-I-Kern).
 *
 * Reine Funktionen ohne Seiteneffekte – damit vollständig unit-testbar.
 * Alle Fenster-Werte sind in MINUTEN.
 *
 * SICHERHEIT: Das Fenster darf NIE unter 5h (300 min) fallen. Diese Grenze
 * wird nach jeder Berechnung erzwungen, nicht nur dokumentiert.
 */

/** Harte Untergrenze des Zeitfensters im Bett: 5 Stunden. */
export const MIN_WINDOW_MIN = 5 * 60; // 300
/** Schrittweite der Titration. */
export const TITRATION_STEP_MIN = 15;
/** Länge eines Titrations-Zyklus in Nächten. */
export const TITRATION_CYCLE_NIGHTS = 7;

/** Obere Effizienz-Schwelle: ab hier Fenster vergrößern. */
export const EFF_INCREASE = 0.9;
/** Untere Effizienz-Schwelle: darunter Fenster verkleinern. */
export const EFF_DECREASE = 0.85;

/** Arithmetisches Mittel; leeres Array → null. */
function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Startfenster = max(Ø der Baseline-TST, 5h).
 *
 * @param baselineTST  TST-Werte (Minuten) der Baseline-Nächte (z.B. erste Woche).
 *                     Leer → Fallback auf die 5h-Untergrenze.
 */
export function startingWindowMin(baselineTST: number[]): number {
  const avg = mean(baselineTST);
  if (avg === null) return MIN_WINDOW_MIN;
  return Math.max(Math.round(avg), MIN_WINDOW_MIN);
}

/**
 * Neues Fenster nach einem Titrations-Zyklus.
 *
 * @param currentWindowMin  Aktuelles Fenster in Minuten.
 * @param avgEfficiency     Ø-Schlafeffizienz der letzten 7 Nächte als Bruch 0..1.
 * @returns                 Neues Fenster in Minuten, nie < 300.
 */
export function nextWindowMin(currentWindowMin: number, avgEfficiency: number): number {
  let next = currentWindowMin;
  if (avgEfficiency >= EFF_INCREASE) {
    next = currentWindowMin + TITRATION_STEP_MIN;
  } else if (avgEfficiency >= EFF_DECREASE) {
    next = currentWindowMin; // halten
  } else {
    next = currentWindowMin - TITRATION_STEP_MIN;
  }
  return Math.max(next, MIN_WINDOW_MIN);
}

/** Ist nach `nightsLogged` abgeschlossenen Nächten ein Titrations-Entscheid fällig? */
export function shouldTitrate(nightsLogged: number): boolean {
  return nightsLogged > 0 && nightsLogged % TITRATION_CYCLE_NIGHTS === 0;
}
