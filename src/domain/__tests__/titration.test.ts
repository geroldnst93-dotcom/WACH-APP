import {
  MIN_WINDOW_MIN,
  TITRATION_STEP_MIN,
  startingWindowMin,
  nextWindowMin,
  shouldTitrate,
} from "../titration";

describe("startingWindowMin", () => {
  it("nutzt den Baseline-Durchschnitt, wenn er über 5h liegt", () => {
    // Ø = (360 + 420 + 390) / 3 = 390
    expect(startingWindowMin([360, 420, 390])).toBe(390);
  });

  it("deckelt bei 5h, wenn die Baseline darunter liegt", () => {
    // Ø = 270 < 300 → 300
    expect(startingWindowMin([240, 300, 270])).toBe(MIN_WINDOW_MIN);
  });

  it("fällt bei fehlender Baseline auf 5h zurück", () => {
    expect(startingWindowMin([])).toBe(MIN_WINDOW_MIN);
  });

  it("rundet den Durchschnitt auf ganze Minuten", () => {
    // Ø = (301 + 302) / 2 = 301.5 → 302
    expect(startingWindowMin([301, 302])).toBe(302);
  });
});

describe("nextWindowMin", () => {
  it("vergrößert bei Effizienz ≥ 90%", () => {
    expect(nextWindowMin(360, 0.92)).toBe(360 + TITRATION_STEP_MIN);
  });

  it("vergrößert bei genau 90% (Grenze inklusive)", () => {
    expect(nextWindowMin(360, 0.9)).toBe(375);
  });

  it("hält zwischen 85% und 90%", () => {
    expect(nextWindowMin(360, 0.87)).toBe(360);
  });

  it("hält bei genau 85% (Grenze inklusive)", () => {
    expect(nextWindowMin(360, 0.85)).toBe(360);
  });

  it("verkleinert bei Effizienz < 85%", () => {
    expect(nextWindowMin(360, 0.8)).toBe(360 - TITRATION_STEP_MIN);
  });

  it("verkleinert knapp unter 85%", () => {
    expect(nextWindowMin(360, 0.849)).toBe(345);
  });

  it("fällt beim Verkleinern nie unter 5h", () => {
    expect(nextWindowMin(305, 0.5)).toBe(MIN_WINDOW_MIN); // 290 → 300
  });

  it("bleibt bei 5h, wenn schon am Minimum und niedrige Effizienz", () => {
    expect(nextWindowMin(MIN_WINDOW_MIN, 0.4)).toBe(MIN_WINDOW_MIN);
  });

  it("vergrößert korrekt auch vom Minimum aus", () => {
    expect(nextWindowMin(MIN_WINDOW_MIN, 0.95)).toBe(MIN_WINDOW_MIN + TITRATION_STEP_MIN);
  });
});

describe("shouldTitrate", () => {
  it("ist alle 7 Nächte fällig", () => {
    expect(shouldTitrate(7)).toBe(true);
    expect(shouldTitrate(14)).toBe(true);
  });

  it("ist zwischendurch nicht fällig", () => {
    expect(shouldTitrate(1)).toBe(false);
    expect(shouldTitrate(6)).toBe(false);
    expect(shouldTitrate(8)).toBe(false);
  });

  it("ist bei 0 Nächten nicht fällig", () => {
    expect(shouldTitrate(0)).toBe(false);
  });
});
