/**
 * SQLite-Schema für WACH. Reine SQL-Strings – dasselbe SQL läuft auf dem Gerät
 * (expo-sqlite) wie im Test (sql.js). `gotUpWhenAwake` wird als INTEGER 0/1/null
 * gespeichert, weil SQLite keinen eigenen Boolean-Typ kennt.
 */

/** Spalten der Tabelle `sleep_days`, in fester Reihenfolge (Mapper hängt daran). */
export const SLEEP_DAY_COLUMNS = [
  "date",
  "eveningSleepAnxiety",
  "eveningPrediction",
  "lightsOff",
  "riseTime",
  "sleepLatencyEst",
  "timeAwakeEst",
  "nightQuality",
  "effort",
  "gotUpWhenAwake",
  "morningDayAnxiety",
  "dayReality",
  "note",
] as const;

export const CREATE_SLEEP_DAYS = `
CREATE TABLE IF NOT EXISTS sleep_days (
  date                TEXT PRIMARY KEY NOT NULL,
  eveningSleepAnxiety INTEGER,
  eveningPrediction   INTEGER,
  lightsOff           TEXT,
  riseTime            TEXT,
  sleepLatencyEst     INTEGER,
  timeAwakeEst        INTEGER,
  nightQuality        INTEGER,
  effort              INTEGER,
  gotUpWhenAwake      INTEGER,
  morningDayAnxiety   INTEGER,
  dayReality          INTEGER,
  note                TEXT
);
`;

/** Vollständiges Setup-Skript (PRAGMA + Tabellen). */
export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
${CREATE_SLEEP_DAYS}
`;

/**
 * Baut das Upsert-Statement: einfügen oder – bei vorhandenem `date` – alle
 * Nicht-Schlüssel-Spalten überschreiben. Generiert aus SLEEP_DAY_COLUMNS,
 * damit Spaltenliste und SQL nie auseinanderlaufen.
 */
export function buildUpsertSql(): string {
  const cols = SLEEP_DAY_COLUMNS.join(", ");
  const placeholders = SLEEP_DAY_COLUMNS.map(() => "?").join(", ");
  const updates = SLEEP_DAY_COLUMNS.filter((c) => c !== "date")
    .map((c) => `${c} = excluded.${c}`)
    .join(", ");
  return `INSERT INTO sleep_days (${cols}) VALUES (${placeholders}) ON CONFLICT(date) DO UPDATE SET ${updates};`;
}
