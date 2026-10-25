/**
 * Tageszeit → vorgeschlagener Tagebuch-Modus. Reine Funktion (testbar).
 *
 * Die vier Haupt-Modi der App:
 *  - "evening": Abend vor dem Zubettgehen (Angst/Vorhersage erfassen)
 *  - "inBed":   im Bett, Licht aus (manueller Übergang per Tap – KEINE Uhr)
 *  - "night":   nachts wach ("3-Uhr"-Modus, Beruhigung/Stimuluskontrolle – KEINE Uhr)
 *  - "morning": nach dem Aufstehen (Schlaf schätzen, Realität erfassen)
 * Zusätzlich "day" als neutraler Überblick tagsüber.
 *
 * `suggestMode` liefert nur den tageszeitbasierten Vorschlag; "inBed" wird vom
 * Abend-Screen aktiv gesetzt, "night" ist nachts jederzeit manuell erreichbar.
 */
export type DayMode = "evening" | "inBed" | "night" | "morning" | "day";

/** Modi, in denen keine Uhrzeit angezeigt werden darf. */
export const CLOCK_FREE_MODES: ReadonlySet<DayMode> = new Set<DayMode>(["inBed", "night"]);

export function isClockFree(mode: DayMode): boolean {
  return CLOCK_FREE_MODES.has(mode);
}

/**
 * Vorschlag anhand der lokalen Stunde:
 *  04–11 morning · 11–18 day · 18–23 evening · 23–04 night
 */
export function suggestMode(now: Date): DayMode {
  const h = now.getHours();
  if (h >= 4 && h < 11) return "morning";
  if (h >= 11 && h < 18) return "day";
  if (h >= 18 && h < 23) return "evening";
  return "night"; // 23:00–03:59
}
