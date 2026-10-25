/**
 * Zugriff auf den Schlüssel-Wert-Zustand (`app_state`).
 *
 * Hier liegt nur, was NICHT aus den Tagebuchdaten ableitbar ist:
 * - onboardingComplete: wurde das Onboarding abgeschlossen?
 * - contraindication:   wurde beim Onboarding eine Kontraindikation angegeben?
 *
 * Werte werden als Text gespeichert; Booleans als "1"/"0".
 */
import { SqlDatabase } from "./repository";

const KEYS = {
  onboardingComplete: "onboardingComplete",
  contraindication: "contraindication",
} as const;

export class AppStateRepository {
  constructor(private readonly db: SqlDatabase) {}

  private async getRaw(key: string): Promise<string | null> {
    const row = await this.db.getFirstAsync<{ value: string | null }>(
      "SELECT value FROM app_state WHERE key = ?",
      [key]
    );
    return row ? row.value : null;
  }

  private async setRaw(key: string, value: string): Promise<void> {
    await this.db.runAsync(
      "INSERT INTO app_state (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      [key, value]
    );
  }

  private async getBool(key: string): Promise<boolean> {
    return (await this.getRaw(key)) === "1";
  }

  private async setBool(key: string, value: boolean): Promise<void> {
    await this.setRaw(key, value ? "1" : "0");
  }

  isOnboardingComplete(): Promise<boolean> {
    return this.getBool(KEYS.onboardingComplete);
  }

  setOnboardingComplete(value: boolean): Promise<void> {
    return this.setBool(KEYS.onboardingComplete, value);
  }

  hasContraindication(): Promise<boolean> {
    return this.getBool(KEYS.contraindication);
  }

  setContraindication(value: boolean): Promise<void> {
    return this.setBool(KEYS.contraindication, value);
  }
}
