/**
 * Programm-Engine: leitet aus allen erfassten Nächten den aktuellen Programm-
 * zustand ab (Baseline- vs. Restriktionsphase und das aktuelle Schlaffenster).
 *
 * Kernidee: ein REINER, IDEMPOTENTER Reducer. Das Fenster wird bei jedem Aufruf
 * von der Baseline aus neu durchgespielt – es ist eine Ableitung der Tagebuch-
 * daten, kein gespeicherter Zustand. Dadurch kann es nicht von den Rohdaten
 * wegdriften, und ein Doppelaufruf titriert nie doppelt.
 */
import { SleepDay } from "./types";
import { computeTST, computeSE } from "./metrics";
import { startingWindowMin, nextWindowMin, TITRATION_CYCLE_NIGHTS } from "./titration";

export type Phase = "baseline" | "restriction";

export interface ProgramState {
  phase: Phase;
  /** Aktuelles Zeitfenster im Bett in Minuten; null, solange Baseline läuft. */
  windowMin: number | null;
  /** Datum, ab dem die Restriktion gilt; null in der Baselinephase. */
  windowStartDate: string | null;
  /** Anzahl bewerteter Nächte (mit berechenbarer Effizienz). */
  scoredNights: number;
}

export interface ProgramConfig {
  /** Nächte zur Baseline-Erhebung, bevor die Restriktion beginnt. */
  baselineNights: number;
  /** Länge eines Titrationszyklus in Nächten. */
  cycleNights: number;
}

export const DEFAULT_PROGRAM_CONFIG: ProgramConfig = {
  baselineNights: TITRATION_CYCLE_NIGHTS, // 7
  cycleNights: TITRATION_CYCLE_NIGHTS, // 7
};

function mean(xs: number[]): number | null {
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** TST-Werte (Minuten) der Nächte mit berechenbarer Schlafzeit. */
export function tstValues(nights: SleepDay[]): number[] {
  return nights.map(computeTST).filter((v): v is number => v !== null);
}

/** Schlafeffizienzen (Bruch 0..1) der Nächte mit berechenbarer Effizienz. */
export function seValues(nights: SleepDay[]): number[] {
  return nights.map(computeSE).filter((v): v is number => v !== null);
}

/**
 * Leitet den Programmzustand aus allen Nächten ab.
 *
 * @param nightsAsc  Alle Nächte AUFSTEIGEND nach Datum.
 * @param config     Baseline-/Zykluslänge (Default 7/7).
 */
export function computeProgram(
  nightsAsc: SleepDay[],
  config: ProgramConfig = DEFAULT_PROGRAM_CONFIG
): ProgramState {
  // Nur bewertbare Nächte (mit Schlafeffizienz) zählen für die Titration.
  const scored = nightsAsc.filter((n) => computeSE(n) !== null);

  if (scored.length < config.baselineNights) {
    return { phase: "baseline", windowMin: null, windowStartDate: null, scoredNights: scored.length };
  }

  const baseline = scored.slice(0, config.baselineNights);
  let windowMin = startingWindowMin(tstValues(baseline));

  const restriction = scored.slice(config.baselineNights);

  // Jeden VOLLSTÄNDIGEN Zyklus abarbeiten; ein angefangener Zyklus titriert noch nicht.
  for (let i = 0; i + config.cycleNights <= restriction.length; i += config.cycleNights) {
    const chunk = restriction.slice(i, i + config.cycleNights);
    const avg = mean(seValues(chunk));
    if (avg !== null) windowMin = nextWindowMin(windowMin, avg);
  }

  const windowStartDate = restriction[0]?.date ?? baseline[baseline.length - 1]?.date ?? null;

  return { phase: "restriction", windowMin, windowStartDate, scoredNights: scored.length };
}
