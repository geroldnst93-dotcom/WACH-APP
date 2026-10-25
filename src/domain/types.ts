/**
 * Datenmodell der WACH-App.
 *
 * Ein `SleepDay` = eine Nacht, geschlüsselt über das Morgen-Datum (YYYY-MM-DD).
 * Alle Eingabefelder sind `null`-bar, weil ein Tag schrittweise entsteht:
 * abends werden Angst/Vorhersage erfasst, morgens Schlaf-Schätzungen und Realität.
 *
 * Wichtig: `lightsOff` / `riseTime` sind VOLLE ISO-Zeitstempel (nicht nur Uhrzeiten),
 * damit die Zeit-im-Bett-Berechnung korrekt über Mitternacht hinweg funktioniert.
 */

/** Skala 0–10, wie sie im Tagebuch durchgängig verwendet wird. */
export type Scale0to10 = number;

export interface SleepDay {
  /** Schlüssel der Nacht = Morgen-Datum, Format YYYY-MM-DD. */
  date: string;

  // --- Abend-Modus ---
  /** Angst vor Schlaflosigkeit am Abend (0–10). */
  eveningSleepAnxiety: Scale0to10 | null;
  /** Vorhersage: wie schlimm wird der morgige Tag? (0–10). */
  eveningPrediction: Scale0to10 | null;

  // --- Nacht / "Im Bett" ---
  /** Zeitpunkt Licht aus / zu Bett (ISO-Zeitstempel). */
  lightsOff: string | null;
  /** Zeitpunkt des Aufstehens (ISO-Zeitstempel). */
  riseTime: string | null;
  /** Geschätzte Einschlaflatenz in Minuten. */
  sleepLatencyEst: number | null;
  /** Geschätzte Wachzeit in der Nacht (WASO) in Minuten. */
  timeAwakeEst: number | null;
  /** Subjektive Schlafqualität (0–10). */
  nightQuality: Scale0to10 | null;
  /** Schlaf-"Anstrengung" – Versuch, aktiv einzuschlafen (0–10). */
  effort: Scale0to10 | null;
  /** Ist die Person bei längerem Wachliegen aufgestanden? (Stimuluskontrolle). */
  gotUpWhenAwake: boolean | null;

  // --- Morgen-Modus ---
  /** Angst bzgl. des bevorstehenden Tages am Morgen (0–10). */
  morningDayAnxiety: Scale0to10 | null;
  /** Wie schlimm war der Tag tatsächlich? (0–10). */
  dayReality: Scale0to10 | null;

  /** Freitext-Notiz. */
  note: string | null;
}

/** Ein frischer, leerer Datensatz für ein gegebenes Datum. */
export function emptySleepDay(date: string): SleepDay {
  return {
    date,
    eveningSleepAnxiety: null,
    eveningPrediction: null,
    lightsOff: null,
    riseTime: null,
    sleepLatencyEst: null,
    timeAwakeEst: null,
    nightQuality: null,
    effort: null,
    gotUpWhenAwake: null,
    morningDayAnxiety: null,
    dayReality: null,
    note: null,
  };
}
