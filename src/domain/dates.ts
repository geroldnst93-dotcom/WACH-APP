/**
 * Datums-Helfer. Reine Funktionen (lokale Zeit).
 *
 * Eine Nacht wird über das MORGEN-Datum geschlüsselt. Damit Abend-, Nacht- und
 * Morgen-Eintrag derselben Nacht in EINEN Datensatz fallen, bestimmt
 * `sleepDayKey` anhand der Uhrzeit, zu welchem Morgen „jetzt" gehört:
 * ab 18 Uhr zählt die kommende Nacht → Datum von morgen.
 */

/** Lokales Datum als YYYY-MM-DD. */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Schlüssel der Nacht, zu der `now` gehört (= zugehöriges Morgen-Datum). */
export function sleepDayKey(now: Date): string {
  const d = new Date(now);
  if (now.getHours() >= 18) {
    d.setDate(d.getDate() + 1); // Abend/Nacht → Morgen von morgen
  }
  return toDateKey(d);
}
