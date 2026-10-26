import { emptySleepDay } from "../types";
import { computeTIB, computeTST, computeSE, computePredictionGap } from "../metrics";

/** Hilfsfunktion: SleepDay mit Schlaf-Feldern für Tests. */
function night(partial: Partial<ReturnType<typeof emptySleepDay>>) {
  return { ...emptySleepDay("2026-10-25"), ...partial };
}

describe("computeTIB", () => {
  it("rechnet korrekt über Mitternacht hinweg", () => {
    // 23:30 → 07:00 = 7h30 = 450 min
    const tib = computeTIB({ lightsOff: "2026-10-24T23:30:00Z", riseTime: "2026-10-25T07:00:00Z" });
    expect(tib).toBe(450);
  });

  it("gibt null zurück, wenn Zeiten fehlen", () => {
    expect(computeTIB({ lightsOff: null, riseTime: "2026-10-25T07:00:00Z" })).toBeNull();
  });
});

describe("computeTST / computeSE", () => {
  const base = night({
    lightsOff: "2026-10-24T23:00:00Z",
    riseTime: "2026-10-25T07:00:00Z", // TIB = 480 min
    sleepLatencyEst: 30,
    timeAwakeEst: 30,
  });

  it("TST = TIB − Latenz − Wachzeit", () => {
    expect(computeTST(base)).toBe(420); // 480 − 30 − 30
  });

  it("SE = TST / TIB als Bruch", () => {
    expect(computeSE(base)).toBeCloseTo(420 / 480, 5); // 0.875
  });

  it("begrenzt TST nach unten auf 0 bei unsinnigen Schätzungen", () => {
    const bad = night({
      lightsOff: "2026-10-24T23:00:00Z",
      riseTime: "2026-10-25T00:00:00Z", // TIB = 60
      sleepLatencyEst: 120,
      timeAwakeEst: 0,
    });
    expect(computeTST(bad)).toBe(0);
  });
});

describe("computePredictionGap", () => {
  it("Vorhersage − Realität (positiv = besser als befürchtet)", () => {
    expect(computePredictionGap({ eveningPrediction: 8, dayReality: 3 })).toBe(5);
  });

  it("null, solange ein Wert fehlt", () => {
    expect(computePredictionGap({ eveningPrediction: 8, dayReality: null })).toBeNull();
  });
});
