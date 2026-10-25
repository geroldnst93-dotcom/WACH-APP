/**
 * Verbindet Persistenz (SleepDayRepository) mit der reinen Programm-Engine.
 *
 * Bewusst dünn: der Service lädt die Nächte und reicht sie in `computeProgram`.
 * Das Schlaffenster wird NICHT gespeichert, sondern bei jedem Aufruf frisch
 * abgeleitet – damit kann es nicht von den Rohdaten wegdriften.
 */
import { SleepDayRepository } from "../db/repository";
import {
  computeProgram,
  ProgramState,
  ProgramConfig,
  DEFAULT_PROGRAM_CONFIG,
} from "../domain/program";

export class ProgramService {
  constructor(
    private readonly days: SleepDayRepository,
    private readonly config: ProgramConfig = DEFAULT_PROGRAM_CONFIG
  ) {}

  /** Aktueller Programmzustand (Phase, Fenster, Startdatum). */
  async state(): Promise<ProgramState> {
    const desc = await this.days.list(); // neueste zuerst
    const asc = [...desc].reverse(); // Engine erwartet aufsteigend
    return computeProgram(asc, this.config);
  }

  /** Aktuelles Zeitfenster in Minuten (null während der Baselinephase). */
  async currentWindowMin(): Promise<number | null> {
    return (await this.state()).windowMin;
  }
}
