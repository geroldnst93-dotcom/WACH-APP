import { computeProgram, ProgramConfig } from "../program";
import { emptySleepDay, SleepDay } from "../types";
import { MIN_WINDOW_MIN } from "../titration";

/**
 * Baut eine Nacht mit gegebener TIB (Minuten) und Schlafeffizienz (Bruch).
 * TIB wird über lightsOff/riseTime ausgedrückt; Wachzeit so gesetzt, dass
 * TST = tib * se ergibt (Latenz 0).
 */
function nightWith(date: string, tibMin: number, se: number): SleepDay {
  const lightsOff = new Date("2026-01-01T22:00:00Z");
  const riseTime = new Date(lightsOff.getTime() + tibMin * 60000);
  const tst = Math.round(tibMin * se);
  return {
    ...emptySleepDay(date),
    lightsOff: lightsOff.toISOString(),
    riseTime: riseTime.toISOString(),
    sleepLatencyEst: 0,
    timeAwakeEst: tibMin - tst, // -> SE = tst/tib
  };
}

function nights(count: number, tibMin: number, se: number, startDay = 1): SleepDay[] {
  return Array.from({ length: count }, (_, i) =>
    nightWith(`2026-02-${String(startDay + i).padStart(2, "0")}`, tibMin, se)
  );
}

const CFG: ProgramConfig = { baselineNights: 7, cycleNights: 7 };

describe("computeProgram – Baselinephase", () => {
  it("bleibt in der Baseline, solange < 7 bewertete Nächte vorliegen", () => {
    const state = computeProgram(nights(6, 420, 0.9), CFG);
    expect(state.phase).toBe("baseline");
    expect(state.windowMin).toBeNull();
    expect(state.scoredNights).toBe(6);
  });

  it("ignoriert Nächte ohne berechenbare Effizienz (nur Abend ausgefüllt)", () => {
    const partial = [
      { ...emptySleepDay("2026-02-01"), eveningPrediction: 8 },
      ...nights(3, 420, 0.9, 2),
    ];
    expect(computeProgram(partial, CFG).scoredNights).toBe(3);
  });
});

describe("computeProgram – Start der Restriktion", () => {
  it("setzt das Startfenster auf max(Ø Baseline-TST, 5h)", () => {
    // 7 Nächte à TIB 480, SE 0.875 -> TST 420 -> Fenster 420
    const state = computeProgram(nights(7, 480, 0.875), CFG);
    expect(state.phase).toBe("restriction");
    expect(state.windowMin).toBe(420);
  });

  it("deckelt das Startfenster bei 5h, wenn die Baseline sehr kurz ist", () => {
    // TST 240 pro Nacht -> Ø < 300 -> 300
    const state = computeProgram(nights(7, 300, 0.8), CFG);
    expect(state.windowMin).toBe(MIN_WINDOW_MIN);
  });
});

describe("computeProgram – Titration pro Zyklus", () => {
  it("vergrößert nach einem Zyklus mit hoher Effizienz um 15 min", () => {
    // Baseline: TST 420 -> Fenster 420. Danach 7 Nächte SE 0.95 -> +15 -> 435
    const all = [...nights(7, 480, 0.875, 1), ...nights(7, 480, 0.95, 8)];
    expect(computeProgram(all, CFG).windowMin).toBe(435);
  });

  it("verkleinert nach einem Zyklus mit niedriger Effizienz um 15 min", () => {
    const all = [...nights(7, 480, 0.875, 1), ...nights(7, 480, 0.7, 8)];
    expect(computeProgram(all, CFG).windowMin).toBe(405);
  });

  it("hält bei mittlerer Effizienz", () => {
    const all = [...nights(7, 480, 0.875, 1), ...nights(7, 480, 0.87, 8)];
    expect(computeProgram(all, CFG).windowMin).toBe(420);
  });

  it("titriert einen angefangenen (unvollständigen) Zyklus noch nicht", () => {
    // Baseline + nur 3 Restriktionsnächte -> kein vollständiger Zyklus
    const all = [...nights(7, 480, 0.875, 1), ...nights(3, 480, 0.99, 8)];
    expect(computeProgram(all, CFG).windowMin).toBe(420);
  });

  it("ist idempotent: zwei vollständige Zyklen ergeben genau zwei Schritte", () => {
    const all = [
      ...nights(7, 480, 0.875, 1), // -> 420
      ...nights(7, 480, 0.95, 8), // +15 -> 435
      ...nights(7, 480, 0.95, 15), // +15 -> 450
    ];
    expect(computeProgram(all, CFG).windowMin).toBe(450);
  });
});
