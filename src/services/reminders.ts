/**
 * Reine Erinnerungs-Konfiguration (ohne nativen Import, daher testbar).
 *
 * Bewusst nur morgens und abends – KEINE nächtlichen Benachrichtigungen, damit
 * das Prinzip "nachts kein Reiz, keine Uhr" nicht verletzt wird.
 */
export interface ReminderDef {
  id: string;
  title: string;
  body: string;
  hour: number; // 0–23
  minute: number; // 0–59
}

export const DEFAULT_REMINDERS: ReminderDef[] = [
  {
    id: "morning",
    title: "Guten Morgen",
    body: "Wie war die Nacht? Halte sie kurz im Tagebuch fest.",
    hour: 8,
    minute: 0,
  },
  {
    id: "evening",
    title: "Abend-Tagebuch",
    body: "Nimm dir vor dem Schlafengehen einen ruhigen Moment.",
    hour: 21,
    minute: 30,
  },
];

/** Gültige Uhrzeit? */
export function isValidReminderTime(r: ReminderDef): boolean {
  return (
    Number.isInteger(r.hour) &&
    Number.isInteger(r.minute) &&
    r.hour >= 0 &&
    r.hour <= 23 &&
    r.minute >= 0 &&
    r.minute <= 59
  );
}
