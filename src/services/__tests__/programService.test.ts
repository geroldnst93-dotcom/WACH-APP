import { ProgramService } from "../programService";
import { SleepDayRepository } from "../../db/repository";
import { makeSqlJsDatabase } from "../../db/__tests__/sqljs-adapter";
import { emptySleepDay } from "../../domain/types";

async function setup() {
  const db = await makeSqlJsDatabase();
  const days = new SleepDayRepository(db);
  await days.init();
  return { days, service: new ProgramService(days) };
}

/** Nacht mit fester TIB (Minuten) und Schlafeffizienz. */
function night(date: string, tibMin: number, se: number) {
  const lightsOff = new Date("2026-01-01T22:00:00Z");
  const riseTime = new Date(lightsOff.getTime() + tibMin * 60000);
  const tst = Math.round(tibMin * se);
  return {
    ...emptySleepDay(date),
    lightsOff: lightsOff.toISOString(),
    riseTime: riseTime.toISOString(),
    sleepLatencyEst: 0,
    timeAwakeEst: tibMin - tst,
  };
}

describe("ProgramService (DB + Engine)", () => {
  it("startet in der Baselinephase ohne Fenster", async () => {
    const { days, service } = await setup();
    await days.save(night("2026-03-01", 420, 0.9));
    const state = await service.state();
    expect(state.phase).toBe("baseline");
    expect(state.windowMin).toBeNull();
  });

  it("leitet nach 7 Baseline-Nächten das Startfenster aus der DB ab", async () => {
    const { days, service } = await setup();
    for (let i = 1; i <= 7; i++) {
      await days.save(night(`2026-03-0${i}`, 480, 0.875)); // TST 420
    }
    expect(await service.currentWindowMin()).toBe(420);
  });

  it("liefert unabhängig von der Speicherreihenfolge dasselbe Ergebnis", async () => {
    const { days, service } = await setup();
    // absichtlich unsortiert speichern; Service sortiert aufsteigend
    const order = [5, 2, 7, 1, 4, 3, 6];
    for (const i of order) {
      await days.save(night(`2026-03-0${i}`, 480, 0.875));
    }
    expect(await service.currentWindowMin()).toBe(420);
  });
});
