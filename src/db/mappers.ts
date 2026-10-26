/**
 * Mapping zwischen DB-Zeile und `SleepDay`. Reine Funktionen.
 *
 * Kritischer Punkt: `gotUpWhenAwake` ist in der App ein `boolean | null`,
 * in SQLite aber INTEGER 0/1/null. Diese Umwandlung passiert ausschließlich hier.
 */
import { SleepDay } from "../domain/types";
import { SLEEP_DAY_COLUMNS } from "./schema";

/** Rohe DB-Zeile: nur primitive SQLite-Werte. */
export type SleepDayRow = Record<string, string | number | null>;

function numOrNull(v: string | number | null | undefined): number | null {
  return v === null || v === undefined ? null : Number(v);
}

function strOrNull(v: string | number | null | undefined): string | null {
  return v === null || v === undefined ? null : String(v);
}

/** 0/1/null aus der DB → boolean/null. */
function boolOrNull(v: string | number | null | undefined): boolean | null {
  return v === null || v === undefined ? null : Number(v) === 1;
}

/** boolean/null → 0/1/null für die DB. */
function boolToInt(v: boolean | null): number | null {
  return v === null ? null : v ? 1 : 0;
}

export function rowToSleepDay(row: SleepDayRow): SleepDay {
  return {
    date: String(row.date),
    eveningSleepAnxiety: numOrNull(row.eveningSleepAnxiety),
    eveningPrediction: numOrNull(row.eveningPrediction),
    lightsOff: strOrNull(row.lightsOff),
    riseTime: strOrNull(row.riseTime),
    sleepLatencyEst: numOrNull(row.sleepLatencyEst),
    timeAwakeEst: numOrNull(row.timeAwakeEst),
    nightQuality: numOrNull(row.nightQuality),
    effort: numOrNull(row.effort),
    gotUpWhenAwake: boolOrNull(row.gotUpWhenAwake),
    morningDayAnxiety: numOrNull(row.morningDayAnxiety),
    dayReality: numOrNull(row.dayReality),
    note: strOrNull(row.note),
  };
}

/**
 * `SleepDay` → Parameter-Array in der Spaltenreihenfolge von SLEEP_DAY_COLUMNS.
 * So passt es direkt auf die `?`-Platzhalter des Upsert-Statements.
 */
export function sleepDayToParams(day: SleepDay): (string | number | null)[] {
  const values: Record<string, string | number | null> = {
    date: day.date,
    eveningSleepAnxiety: day.eveningSleepAnxiety,
    eveningPrediction: day.eveningPrediction,
    lightsOff: day.lightsOff,
    riseTime: day.riseTime,
    sleepLatencyEst: day.sleepLatencyEst,
    timeAwakeEst: day.timeAwakeEst,
    nightQuality: day.nightQuality,
    effort: day.effort,
    gotUpWhenAwake: boolToInt(day.gotUpWhenAwake),
    morningDayAnxiety: day.morningDayAnxiety,
    dayReality: day.dayReality,
    note: day.note,
  };
  return SLEEP_DAY_COLUMNS.map((c) => values[c] ?? null);
}
