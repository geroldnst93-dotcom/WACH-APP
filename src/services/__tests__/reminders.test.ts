import { DEFAULT_REMINDERS, isValidReminderTime } from "../reminders";

describe("DEFAULT_REMINDERS", () => {
  it("enthält morgens und abends", () => {
    expect(DEFAULT_REMINDERS.map((r) => r.id).sort()).toEqual(["evening", "morning"]);
  });

  it("hat eindeutige IDs", () => {
    const ids = DEFAULT_REMINDERS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("hat gültige Uhrzeiten", () => {
    for (const r of DEFAULT_REMINDERS) {
      expect(isValidReminderTime(r)).toBe(true);
    }
  });

  it("plant keine nächtlichen Erinnerungen (22–05 Uhr)", () => {
    for (const r of DEFAULT_REMINDERS) {
      const nightly = r.hour >= 22 || r.hour < 5;
      expect(nightly).toBe(false);
    }
  });
});

describe("isValidReminderTime", () => {
  it("lehnt ungültige Stunden/Minuten ab", () => {
    expect(isValidReminderTime({ id: "x", title: "", body: "", hour: 24, minute: 0 })).toBe(false);
    expect(isValidReminderTime({ id: "x", title: "", body: "", hour: 8, minute: 60 })).toBe(false);
  });
});
