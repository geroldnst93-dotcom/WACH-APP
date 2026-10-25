/**
 * Abgeleitete Schlaf-Kennzahlen. Reine Funktionen, keine Seiteneffekte.
 *
 * Diese Werte werden NICHT gespeichert, sondern immer aus dem `SleepDay`
 * berechnet (Single Source of Truth). So kann es keine widersprüchlichen
 * Stände zwischen Rohdaten und abgeleiteten Zahlen geben.
 */
import { SleepDay } from "./types";

/** Differenz zweier ISO-Zeitstempel in Minuten (b − a), gerundet. */
export function diffMinutes(aIso: string, bIso: string): number {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  return Math.round((b - a) / 60000);
}

/** Zeit im Bett (TIB) in Minuten: riseTime − lightsOff. */
export function computeTIB(day: Pick<SleepDay, "lightsOff" | "riseTime">): number | null {
  if (!day.lightsOff || !day.riseTime) return null;
  const tib = diffMinutes(day.lightsOff, day.riseTime);
  return tib > 0 ? tib : null;
}

/**
 * Gesamtschlafzeit (TST) in Minuten: TIB − Einschlaflatenz − Wachzeit.
 * Wird auf [0, TIB] begrenzt, damit grobe Schätzfehler keine unsinnigen
 * (negativen) Werte erzeugen.
 */
export function computeTST(day: SleepDay): number | null {
  const tib = computeTIB(day);
  if (tib === null) return null;
  const latency = day.sleepLatencyEst ?? 0;
  const awake = day.timeAwakeEst ?? 0;
  const tst = tib - latency - awake;
  return Math.min(Math.max(tst, 0), tib);
}

/** Schlafeffizienz (SE) als Bruch 0..1: TST / TIB. */
export function computeSE(day: SleepDay): number | null {
  const tib = computeTIB(day);
  const tst = computeTST(day);
  if (tib === null || tst === null || tib === 0) return null;
  return tst / tib;
}

/**
 * Vorhersage-Lücke: Abend-Vorhersage − Tages-Realität.
 * Positiv = der Tag war besser als befürchtet (zentraler therapeutischer Effekt).
 */
export function computePredictionGap(
  day: Pick<SleepDay, "eveningPrediction" | "dayReality">
): number | null {
  if (day.eveningPrediction === null || day.dayReality === null) return null;
  return day.eveningPrediction - day.dayReality;
}
