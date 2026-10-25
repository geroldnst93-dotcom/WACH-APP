/**
 * Die vier kontextuellen Tagebuch-Modi plus Tagesübersicht.
 *
 * Darstellung + Erfassung; jede Schlaf-Berechnung kommt aus src/domain.
 * WICHTIG: `InBedMode` und `NightMode` zeigen bewusst KEINE Uhrzeit.
 */
import React from "react";
import { View } from "react-native";
import { SleepDay } from "../domain/types";
import { computeTIB, computeTST, computeSE, computePredictionGap } from "../domain/metrics";
import {
  Card,
  Title,
  Subtitle,
  Label,
  Paragraph,
  PrimaryButton,
  SecondaryButton,
  ScaleInput,
  YesNo,
  MinutesStepper,
  NoteField,
  Metric,
} from "./components";
import { space } from "./theme";

type PatchFields = Partial<Omit<SleepDay, "date">>;

export interface ModeProps {
  day: SleepDay;
  onPatch: (fields: PatchFields) => void;
  windowMin: number | null;
}

/** Minuten → "7 h 05". */
function hm(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h} h ${String(m).padStart(2, "0")}`;
}

// ───────────────────────────── Abend ─────────────────────────────

export function EveningMode({
  day,
  onPatch,
  onGoToBed,
}: ModeProps & { onGoToBed: () => void }) {
  return (
    <>
      <Title>Guten Abend</Title>
      <Card>
        <Label>Wie groß ist gerade die Angst vor der kommenden Nacht?</Label>
        <ScaleInput
          value={day.eveningSleepAnxiety}
          onChange={(v) => onPatch({ eveningSleepAnxiety: v })}
          lowLabel="ruhig"
          highLabel="sehr ängstlich"
        />
      </Card>
      <Card>
        <Label>Wie schlimm wird der morgige Tag – wenn du schlecht schläfst?</Label>
        <ScaleInput
          value={day.eveningPrediction}
          onChange={(v) => onPatch({ eveningPrediction: v })}
          lowLabel="gut machbar"
          highLabel="katastrophal"
        />
        <Paragraph>
          Diese Vorhersage vergleichen wir morgen mit der Realität. Meist ist der Tag
          besser als die Angst behauptet.
        </Paragraph>
      </Card>
      <PrimaryButton
        title="Licht aus – ich lege mich hin"
        onPress={() => {
          onPatch({ lightsOff: new Date().toISOString() });
          onGoToBed();
        }}
      />
    </>
  );
}

// ──────────────────────────── Im Bett ────────────────────────────
// Keine Uhrzeit. Fokus: Anspannung lösen, nicht „Schlaf erzwingen".

export function InBedMode({
  day,
  onPatch,
  onCantSleep,
}: ModeProps & { onCantSleep: () => void }) {
  return (
    <>
      <Title>Im Bett</Title>
      <Card>
        <Paragraph>
          Du musst jetzt nichts leisten. Schlaf lässt sich nicht erzwingen – nur
          zulassen. Lege die Aufmerksamkeit auf den ruhigen Ausatem.
        </Paragraph>
      </Card>
      <Card>
        <Label>Wie sehr versuchst du gerade aktiv, einzuschlafen?</Label>
        <ScaleInput
          value={day.effort}
          onChange={(v) => onPatch({ effort: v })}
          lowLabel="lasse los"
          highLabel="strenge mich an"
        />
        <Paragraph>Je weniger Anstrengung, desto leichter kommt der Schlaf.</Paragraph>
      </Card>
      <SecondaryButton title="Ich liege lange wach" onPress={onCantSleep} />
    </>
  );
}

// ──────────────────────── 3-Uhr / nachts wach ────────────────────────
// Keine Uhrzeit. Beruhigung + Stimuluskontrolle.

export function NightMode({
  onPatch,
  onBackToBed,
}: ModeProps & { onBackToBed: () => void }) {
  return (
    <>
      <Title>Wach – und das ist okay</Title>
      <Card>
        <Paragraph>
          Wachphasen in der Nacht sind normal. Schau bewusst nicht auf die Uhr – sie
          macht die Rechnung nur lauter. Dein Körper holt sich den Schlaf, den er braucht.
        </Paragraph>
      </Card>
      <Card>
        <Subtitle>Wenn du schon länger wach liegst</Subtitle>
        <Paragraph>
          Steh auf, geh in einen anderen Raum, mach etwas Ruhiges bei gedämpftem Licht –
          bis du dich wieder schläfrig fühlst. Das Bett bleibt dem Schlaf vorbehalten.
        </Paragraph>
        <View style={{ gap: space(3), marginTop: space(2) }}>
          <PrimaryButton
            title="Ich stehe auf"
            onPress={() => onPatch({ gotUpWhenAwake: true })}
          />
          <SecondaryButton title="Ich bin wieder müde – zurück ins Bett" onPress={onBackToBed} />
        </View>
      </Card>
    </>
  );
}

// ───────────────────────────── Morgen ─────────────────────────────

export function MorningMode({ day, onPatch, windowMin }: ModeProps) {
  const tib = computeTIB(day);
  const tst = computeTST(day);
  const se = computeSE(day);
  const gap = computePredictionGap(day);

  return (
    <>
      <Title>Guten Morgen</Title>

      {day.riseTime === null && (
        <PrimaryButton
          title="Ich bin gerade aufgestanden"
          onPress={() => onPatch({ riseTime: new Date().toISOString() })}
        />
      )}

      <Card>
        <Label>Wie lange hast du geschätzt zum Einschlafen gebraucht?</Label>
        <MinutesStepper
          value={day.sleepLatencyEst}
          onChange={(v) => onPatch({ sleepLatencyEst: v })}
        />
      </Card>
      <Card>
        <Label>Wie lange warst du nachts insgesamt wach?</Label>
        <MinutesStepper value={day.timeAwakeEst} onChange={(v) => onPatch({ timeAwakeEst: v })} />
      </Card>
      <Card>
        <Label>Bist du bei längerem Wachliegen aufgestanden?</Label>
        <YesNo value={day.gotUpWhenAwake} onChange={(v) => onPatch({ gotUpWhenAwake: v })} />
      </Card>
      <Card>
        <Label>Wie war die Schlafqualität?</Label>
        <ScaleInput
          value={day.nightQuality}
          onChange={(v) => onPatch({ nightQuality: v })}
          lowLabel="sehr schlecht"
          highLabel="erholsam"
        />
      </Card>

      {(tst !== null || se !== null) && (
        <Card>
          <Subtitle>Diese Nacht</Subtitle>
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: space(2) }}>
            {tst !== null && <Metric label="geschlafen" value={hm(tst)} />}
            {se !== null && <Metric label="Effizienz" value={`${Math.round(se * 100)} %`} />}
            {windowMin !== null && <Metric label="Fenster" value={hm(windowMin)} />}
          </View>
          {tib !== null && (
            <Paragraph>
              Zeit im Bett: {hm(tib)}. Die Effizienz ist wichtiger als die reine Schlafdauer.
            </Paragraph>
          )}
        </Card>
      )}

      <Card>
        <Label>Wie groß ist jetzt die Angst vor dem Tag?</Label>
        <ScaleInput
          value={day.morningDayAnxiety}
          onChange={(v) => onPatch({ morningDayAnxiety: v })}
          lowLabel="gelassen"
          highLabel="sehr ängstlich"
        />
      </Card>
      <Card>
        <Label>Notiz zur Nacht</Label>
        <NoteField
          value={day.note}
          onChange={(v) => onPatch({ note: v })}
          placeholder="Gedanken, Auslöser, Beobachtungen …"
        />
      </Card>

      {gap !== null && (
        <Card>
          <Subtitle>Vorhersage vs. Realität</Subtitle>
          <Paragraph>
            {gap > 0
              ? `Dein Tag war um ${gap} Punkte besser als die abendliche Befürchtung. Genau das lernt dein Nervensystem mit jeder Nacht.`
              : gap === 0
              ? "Vorhersage und Realität lagen gleichauf."
              : `Der Tag war um ${Math.abs(gap)} Punkte schwerer als erwartet – das kommt vor und sagt nichts über morgen.`}
          </Paragraph>
        </Card>
      )}
      <Paragraph>
        Trag abends die Realität des Tages nach, um die Lücke zur Befürchtung zu schließen.
      </Paragraph>
    </>
  );
}

// ──────────────────────────── Tagsüber ────────────────────────────

export function OverviewMode({
  day,
  onPatch,
  windowMin,
  phase,
  scoredNights,
}: ModeProps & { phase: "baseline" | "restriction"; scoredNights: number }) {
  return (
    <>
      <Title>WACH</Title>
      <Card>
        <Subtitle>Dein Programm</Subtitle>
        {phase === "baseline" ? (
          <Paragraph>
            Baselinephase: noch {Math.max(0, 7 - scoredNights)} Nächte aufzeichnen, dann
            berechnen wir dein persönliches Schlaffenster.
          </Paragraph>
        ) : (
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: space(2) }}>
            {windowMin !== null && <Metric label="Schlaffenster" value={hm(windowMin)} />}
            <Metric label="Nächte erfasst" value={String(scoredNights)} />
          </View>
        )}
      </Card>
      <Card>
        <Label>Wie war der Tag wirklich?</Label>
        <ScaleInput
          value={day.dayReality}
          onChange={(v) => onPatch({ dayReality: v })}
          lowLabel="guter Tag"
          highLabel="sehr schwerer Tag"
        />
        <Paragraph>
          Das ist der Realitäts-Check zur abendlichen Vorhersage – die wichtigste
          Übung gegen die Angst.
        </Paragraph>
      </Card>
    </>
  );
}
