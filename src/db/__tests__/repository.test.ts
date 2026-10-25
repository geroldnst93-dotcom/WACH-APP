import { SleepDayRepository } from "../repository";
import { emptySleepDay } from "../../domain/types";
import { makeSqlJsDatabase } from "./sqljs-adapter";

async function freshRepo(): Promise<SleepDayRepository> {
  const db = await makeSqlJsDatabase();
  const repo = new SleepDayRepository(db);
  await repo.init();
  return repo;
}

describe("SleepDayRepository (gegen echtes SQLite via sql.js)", () => {
  it("speichert und liest einen vollständigen Tag zurück", async () => {
    const repo = await freshRepo();
    const day = {
      ...emptySleepDay("2026-10-20"),
      eveningSleepAnxiety: 7,
      eveningPrediction: 8,
      lightsOff: "2026-10-19T23:00:00Z",
      riseTime: "2026-10-20T07:00:00Z",
      sleepLatencyEst: 30,
      timeAwakeEst: 20,
      nightQuality: 4,
      effort: 6,
      gotUpWhenAwake: true,
      morningDayAnxiety: 5,
      dayReality: 3,
      note: "unruhig",
    };
    await repo.save(day);
    expect(await repo.get("2026-10-20")).toEqual(day);
  });

  it("gibt null für einen unbekannten Tag zurück", async () => {
    const repo = await freshRepo();
    expect(await repo.get("1999-01-01")).toBeNull();
  });

  it("macht aus boolean korrekt 0/1/null und zurück", async () => {
    const repo = await freshRepo();
    await repo.patch("2026-10-01", { gotUpWhenAwake: false });
    expect((await repo.get("2026-10-01"))?.gotUpWhenAwake).toBe(false);

    await repo.patch("2026-10-02", { gotUpWhenAwake: true });
    expect((await repo.get("2026-10-02"))?.gotUpWhenAwake).toBe(true);

    // nie gesetzt -> bleibt null
    await repo.patch("2026-10-03", { note: "x" });
    expect((await repo.get("2026-10-03"))?.gotUpWhenAwake).toBeNull();
  });

  it("merged mit patch, ohne vorhandene Felder zu überschreiben", async () => {
    const repo = await freshRepo();
    // Abend-Modus
    await repo.patch("2026-10-10", { eveningSleepAnxiety: 8, eveningPrediction: 9 });
    // Morgen-Modus am selben Tag
    await repo.patch("2026-10-10", { dayReality: 2, morningDayAnxiety: 4 });

    const day = await repo.get("2026-10-10");
    expect(day).toMatchObject({
      eveningSleepAnxiety: 8,
      eveningPrediction: 9,
      dayReality: 2,
      morningDayAnxiety: 4,
    });
  });

  it("save überschreibt einen bestehenden Tag (Upsert)", async () => {
    const repo = await freshRepo();
    await repo.save({ ...emptySleepDay("2026-10-05"), nightQuality: 3 });
    await repo.save({ ...emptySleepDay("2026-10-05"), nightQuality: 9 });
    expect((await repo.get("2026-10-05"))?.nightQuality).toBe(9);
    expect(await repo.count()).toBe(1);
  });

  it("listet neueste Tage zuerst und respektiert das Limit", async () => {
    const repo = await freshRepo();
    for (const d of ["2026-10-01", "2026-10-02", "2026-10-03"]) {
      await repo.save(emptySleepDay(d));
    }
    const all = await repo.list();
    expect(all.map((d) => d.date)).toEqual(["2026-10-03", "2026-10-02", "2026-10-01"]);
    const limited = await repo.list(2);
    expect(limited.map((d) => d.date)).toEqual(["2026-10-03", "2026-10-02"]);
  });

  it("listRange liefert aufsteigend und inklusiv (für Baseline)", async () => {
    const repo = await freshRepo();
    for (const d of ["2026-09-30", "2026-10-01", "2026-10-07", "2026-10-08"]) {
      await repo.save(emptySleepDay(d));
    }
    const range = await repo.listRange("2026-10-01", "2026-10-07");
    expect(range.map((d) => d.date)).toEqual(["2026-10-01", "2026-10-07"]);
  });

  it("zählt und löscht Tage", async () => {
    const repo = await freshRepo();
    await repo.save(emptySleepDay("2026-10-01"));
    await repo.save(emptySleepDay("2026-10-02"));
    expect(await repo.count()).toBe(2);
    await repo.remove("2026-10-01");
    expect(await repo.count()).toBe(1);
    expect(await repo.get("2026-10-01")).toBeNull();
  });
});
