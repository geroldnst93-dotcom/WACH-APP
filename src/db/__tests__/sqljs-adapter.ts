/**
 * Test-Adapter: implementiert die `SqlDatabase`-Schnittstelle über sql.js
 * (SQLite als WASM). Dadurch laufen die Repository-Tests gegen echtes SQLite
 * mit genau dem SQL, das später über expo-sqlite auf dem Gerät läuft.
 *
 * Nur für Tests – nicht Teil des App-Bundles.
 */
import path from "path";
import initSqlJs, { Database } from "sql.js";
import { SqlDatabase, SqlParam } from "../repository";

function queryAll(db: Database, sql: string, params: SqlParam[]): Record<string, unknown>[] {
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params as (string | number | null)[]);
    const rows: Record<string, unknown>[] = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    return rows;
  } finally {
    stmt.free();
  }
}

export async function makeSqlJsDatabase(): Promise<SqlDatabase> {
  // WASM-Datei liegt neben dem JS-Einstieg im installierten Paket.
  const wasmDir = path.dirname(require.resolve("sql.js/dist/sql-wasm.js"));
  const SQL = await initSqlJs({ locateFile: (file: string) => path.join(wasmDir, file) });
  const db = new SQL.Database();

  return {
    async execAsync(sql: string) {
      db.run(sql);
    },
    async runAsync(sql: string, params: SqlParam[] = []) {
      db.run(sql, params as (string | number | null)[]);
      return undefined;
    },
    async getFirstAsync<T>(sql: string, params: SqlParam[] = []) {
      const rows = queryAll(db, sql, params);
      return (rows[0] as T | undefined) ?? null;
    },
    async getAllAsync<T>(sql: string, params: SqlParam[] = []) {
      return queryAll(db, sql, params) as T[];
    },
  };
}
