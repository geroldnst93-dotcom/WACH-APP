/**
 * Öffnet die SQLite-DB einmalig beim App-Start, ruft `init()` auf und stellt
 * Repositories + ProgramService per Context bereit. So enthalten die Screens
 * selbst keine Schlaf-Logik – sie rufen nur die getestete Domäne auf.
 */
import React, { createContext, useContext, useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { openWachDatabase } from "../db/expoDatabase";
import { SleepDayRepository } from "../db/repository";
import { AppStateRepository } from "../db/appState";
import { ProgramService } from "../services/programService";
import { colors, space, font } from "./theme";

export interface WachDb {
  days: SleepDayRepository;
  appState: AppStateRepository;
  program: ProgramService;
}

const DatabaseContext = createContext<WachDb | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<WachDb | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const sql = await openWachDatabase();
        const days = new SleepDayRepository(sql);
        await days.init();
        if (!active) return;
        setDb({
          days,
          appState: new AppStateRepository(sql),
          program: new ProgramService(days),
        });
      } catch (e) {
        if (active) setError(String(e));
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Datenbank konnte nicht geöffnet werden.</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  if (!db) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.amber} />
      </View>
    );
  }

  return <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>;
}

export function useDb(): WachDb {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error("useDb muss innerhalb von <DatabaseProvider> verwendet werden");
  return ctx;
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", gap: space(3), padding: space(6) },
  error: { color: colors.danger, fontSize: font.h3, fontWeight: "700", textAlign: "center" },
  errorDetail: { color: colors.textMuted, fontSize: font.small, textAlign: "center" },
});
