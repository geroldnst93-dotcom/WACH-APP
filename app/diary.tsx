import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Screen } from "../src/ui/components";
import { useDb } from "../src/ui/db-context";
import { colors, space, radius, font } from "../src/ui/theme";
import { SleepDay, emptySleepDay } from "../src/domain/types";
import { DayMode, suggestMode } from "../src/domain/mode";
import { sleepDayKey } from "../src/domain/dates";
import { ProgramState } from "../src/domain/program";
import {
  EveningMode,
  InBedMode,
  NightMode,
  MorningMode,
  OverviewMode,
} from "../src/ui/modes";

type PatchFields = Partial<Omit<SleepDay, "date">>;

const MODE_LABELS: { mode: DayMode; label: string }[] = [
  { mode: "evening", label: "Abend" },
  { mode: "inBed", label: "Im Bett" },
  { mode: "night", label: "Nachts" },
  { mode: "morning", label: "Morgen" },
  { mode: "day", label: "Tag" },
];

export default function Diary() {
  const { days, program } = useDb();
  const key = useMemo(() => sleepDayKey(new Date()), []);
  const [mode, setMode] = useState<DayMode>(() => suggestMode(new Date()));
  const [day, setDay] = useState<SleepDay | null>(null);
  const [prog, setProg] = useState<ProgramState | null>(null);

  const refreshProgram = useCallback(() => {
    program.state().then(setProg);
  }, [program]);

  useEffect(() => {
    let active = true;
    days.get(key).then((loaded) => {
      if (active) setDay(loaded ?? emptySleepDay(key));
    });
    refreshProgram();
    return () => {
      active = false;
    };
  }, [days, key, refreshProgram]);

  const patch = useCallback(
    (fields: PatchFields) => {
      setDay((prev) => (prev ? { ...prev, ...fields } : prev)); // optimistisch
      days.patch(key, fields).then(refreshProgram);
    },
    [days, key, refreshProgram]
  );

  if (!day) return <Screen />;

  const windowMin = prog?.windowMin ?? null;
  const phase = prog?.phase ?? "baseline";
  const scoredNights = prog?.scoredNights ?? 0;

  return (
    <Screen>
      <ModeSwitcher mode={mode} onSelect={setMode} />
      {mode === "evening" && (
        <EveningMode day={day} onPatch={patch} windowMin={windowMin} onGoToBed={() => setMode("inBed")} />
      )}
      {mode === "inBed" && (
        <InBedMode day={day} onPatch={patch} windowMin={windowMin} onCantSleep={() => setMode("night")} />
      )}
      {mode === "night" && (
        <NightMode day={day} onPatch={patch} windowMin={windowMin} onBackToBed={() => setMode("inBed")} />
      )}
      {mode === "morning" && <MorningMode day={day} onPatch={patch} windowMin={windowMin} />}
      {mode === "day" && (
        <OverviewMode
          day={day}
          onPatch={patch}
          windowMin={windowMin}
          phase={phase}
          scoredNights={scoredNights}
        />
      )}
    </Screen>
  );
}

/** Horizontale Modus-Pillen zum manuellen Wechseln. */
function ModeSwitcher({ mode, onSelect }: { mode: DayMode; onSelect: (m: DayMode) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.switcher}
    >
      {MODE_LABELS.map(({ mode: m, label }) => {
        const active = m === mode;
        return (
          <Pressable
            key={m}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(m)}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  switcher: { gap: space(2), paddingVertical: space(1) },
  pill: {
    paddingHorizontal: space(4),
    paddingVertical: space(2.5),
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: { backgroundColor: colors.surfaceAlt, borderColor: colors.amber },
  pillText: { color: colors.textMuted, fontSize: font.small, fontWeight: "600" },
  pillTextActive: { color: colors.amber },
});
