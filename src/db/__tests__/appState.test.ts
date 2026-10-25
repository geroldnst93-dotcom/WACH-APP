import { AppStateRepository } from "../appState";
import { SleepDayRepository } from "../repository";
import { makeSqlJsDatabase } from "./sqljs-adapter";

async function fresh(): Promise<AppStateRepository> {
  const db = await makeSqlJsDatabase();
  await new SleepDayRepository(db).init(); // legt auch app_state an
  return new AppStateRepository(db);
}

describe("AppStateRepository", () => {
  it("default: Onboarding nicht abgeschlossen, keine Kontraindikation", async () => {
    const s = await fresh();
    expect(await s.isOnboardingComplete()).toBe(false);
    expect(await s.hasContraindication()).toBe(false);
  });

  it("speichert und liest die Flags", async () => {
    const s = await fresh();
    await s.setOnboardingComplete(true);
    await s.setContraindication(true);
    expect(await s.isOnboardingComplete()).toBe(true);
    expect(await s.hasContraindication()).toBe(true);
  });

  it("überschreibt vorhandene Werte (Upsert)", async () => {
    const s = await fresh();
    await s.setOnboardingComplete(true);
    await s.setOnboardingComplete(false);
    expect(await s.isOnboardingComplete()).toBe(false);
  });
});
