import { toDateKey, sleepDayKey } from "../dates";

function at(month: number, day: number, hour: number): Date {
  const d = new Date();
  d.setFullYear(2026, month - 1, day);
  d.setHours(hour, 0, 0, 0);
  return d;
}

describe("toDateKey", () => {
  it("formatiert lokal als YYYY-MM-DD mit führenden Nullen", () => {
    expect(toDateKey(at(3, 5, 9))).toBe("2026-03-05");
  });
});

describe("sleepDayKey", () => {
  it("morgens zählt zum heutigen Datum", () => {
    expect(sleepDayKey(at(10, 25, 7))).toBe("2026-10-25");
  });
  it("tagsüber zählt zum heutigen Datum", () => {
    expect(sleepDayKey(at(10, 25, 14))).toBe("2026-10-25");
  });
  it("abends (>=18 Uhr) zählt zur Nacht auf morgen", () => {
    expect(sleepDayKey(at(10, 25, 22))).toBe("2026-10-26");
  });
  it("nach Mitternacht zählt zum heutigen (= kommenden) Morgen", () => {
    expect(sleepDayKey(at(10, 26, 2))).toBe("2026-10-26");
  });
  it("behandelt Monatswechsel am Abend korrekt", () => {
    expect(sleepDayKey(at(10, 31, 23))).toBe("2026-11-01");
  });
});
