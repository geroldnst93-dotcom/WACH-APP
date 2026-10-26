/**
 * Öffnet die lokale SQLite-DB über expo-sqlite und verpackt sie in die
 * `SqlDatabase`-Schnittstelle, die Repository und Service erwarten.
 * (Nur zur Laufzeit auf dem Gerät – in Tests kommt stattdessen sql.js.)
 */
import * as SQLite from "expo-sqlite";
import { SqlDatabase, SqlParam } from "./repository";

export async function openWachDatabase(name = "wach.db"): Promise<SqlDatabase> {
  const db = await SQLite.openDatabaseAsync(name);
  const adapter: SqlDatabase = {
    execAsync: (sql) => db.execAsync(sql),
    runAsync: (sql, params = []) => db.runAsync(sql, params),
    getFirstAsync: <T,>(sql: string, params: SqlParam[] = []) =>
      db.getFirstAsync<T>(sql, params),
    getAllAsync: <T,>(sql: string, params: SqlParam[] = []) => db.getAllAsync<T>(sql, params),
  };
  return adapter;
}
