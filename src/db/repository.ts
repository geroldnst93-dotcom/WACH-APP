/**
 * Persistenz-Schicht für `SleepDay`. Lokal-first, kein Backend.
 *
 * Das Repository hängt NICHT direkt an expo-sqlite, sondern an der schmalen
 * Schnittstelle `SqlDatabase`. Deren Methodennamen entsprechen genau denen von
 * expo-sqlite, sodass die App ihre DB direkt übergeben kann. Im Test wird dieselbe
 * Schnittstelle von sql.js (echtes SQLite als WASM) implementiert.
 */
import { SleepDay, emptySleepDay } from "../domain/types";
import { SCHEMA_SQL, buildUpsertSql } from "./schema";
import { rowToSleepDay, sleepDayToParams, SleepDayRow } from "./mappers";

export type SqlParam = string | number | null;

/** Minimaler SQLite-Zugriff – deckungsgleich mit der API von expo-sqlite. */
export interface SqlDatabase {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: SqlParam[]): Promise<unknown>;
  getFirstAsync<T>(sql: string, params?: SqlParam[]): Promise<T | null>;
  getAllAsync<T>(sql: string, params?: SqlParam[]): Promise<T[]>;
}

export class SleepDayRepository {
  private readonly upsertSql = buildUpsertSql();

  constructor(private readonly db: SqlDatabase) {}

  /** Legt Tabellen an (idempotent). Einmal beim App-Start aufrufen. */
  async init(): Promise<void> {
    await this.db.execAsync(SCHEMA_SQL);
  }

  /** Vollständiges Speichern (einfügen oder überschreiben) nach `date`. */
  async save(day: SleepDay): Promise<void> {
    await this.db.runAsync(this.upsertSql, sleepDayToParams(day));
  }

  /**
   * Teil-Aktualisierung: lädt den bestehenden Tag (oder einen leeren),
   * mischt die gegebenen Felder und speichert. So liegt die Merge-Logik an
   * einer einzigen, getesteten Stelle – passend zu den tageszeit-abhängigen
   * Modi (abends nur Angst/Vorhersage, morgens die Schlafdaten).
   */
  async patch(date: string, fields: Partial<Omit<SleepDay, "date">>): Promise<SleepDay> {
    const existing = (await this.get(date)) ?? emptySleepDay(date);
    const merged: SleepDay = { ...existing, ...fields, date };
    await this.save(merged);
    return merged;
  }

  /** Einen Tag laden oder null. */
  async get(date: string): Promise<SleepDay | null> {
    const row = await this.db.getFirstAsync<SleepDayRow>(
      "SELECT * FROM sleep_days WHERE date = ?",
      [date]
    );
    return row ? rowToSleepDay(row) : null;
  }

  /** Neueste Tage zuerst; optionales Limit. */
  async list(limit?: number): Promise<SleepDay[]> {
    const sql =
      "SELECT * FROM sleep_days ORDER BY date DESC" + (limit != null ? " LIMIT ?" : "");
    const rows = await this.db.getAllAsync<SleepDayRow>(sql, limit != null ? [limit] : []);
    return rows.map(rowToSleepDay);
  }

  /** Tage in einem (inklusiven) Datumsbereich, aufsteigend – für Baseline/Titration. */
  async listRange(fromDate: string, toDate: string): Promise<SleepDay[]> {
    const rows = await this.db.getAllAsync<SleepDayRow>(
      "SELECT * FROM sleep_days WHERE date >= ? AND date <= ? ORDER BY date ASC",
      [fromDate, toDate]
    );
    return rows.map(rowToSleepDay);
  }

  /** Anzahl erfasster Tage – nützlich für den 7-Nächte-Titrationszyklus. */
  async count(): Promise<number> {
    const row = await this.db.getFirstAsync<{ n: number }>(
      "SELECT COUNT(*) AS n FROM sleep_days"
    );
    return row?.n ?? 0;
  }

  /** Einen Tag löschen. */
  async remove(date: string): Promise<void> {
    await this.db.runAsync("DELETE FROM sleep_days WHERE date = ?", [date]);
  }
}
