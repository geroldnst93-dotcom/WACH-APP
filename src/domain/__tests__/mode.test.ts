import { suggestMode, isClockFree } from "../mode";

/** Lokale Zeit mit gegebener Stunde. */
function at(hour: number): Date {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d;
}

describe("suggestMode", () => {
  it("morgens (04–11)", () => {
    expect(suggestMode(at(4))).toBe("morning");
    expect(suggestMode(at(10))).toBe("morning");
  });
  it("tagsüber (11–18)", () => {
    expect(suggestMode(at(11))).toBe("day");
    expect(suggestMode(at(17))).toBe("day");
  });
  it("abends (18–23)", () => {
    expect(suggestMode(at(18))).toBe("evening");
    expect(suggestMode(at(22))).toBe("evening");
  });
  it("nachts (23–04)", () => {
    expect(suggestMode(at(23))).toBe("night");
    expect(suggestMode(at(2))).toBe("night");
    expect(suggestMode(at(3))).toBe("night");
  });
});

describe("isClockFree", () => {
  it("Nacht-Modi verbergen die Uhr", () => {
    expect(isClockFree("inBed")).toBe(true);
    expect(isClockFree("night")).toBe(true);
  });
  it("Tag-Modi dürfen die Uhr zeigen", () => {
    expect(isClockFree("evening")).toBe(false);
    expect(isClockFree("morning")).toBe(false);
    expect(isClockFree("day")).toBe(false);
  });
});
