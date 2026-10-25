import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  Card,
  Title,
  Subtitle,
  Paragraph,
  PrimaryButton,
  SecondaryButton,
  CheckRow,
} from "../src/ui/components";
import { useDb } from "../src/ui/db-context";
import { space } from "../src/ui/theme";

const CONTRAINDICATIONS = [
  "Bipolare Störung",
  "Epilepsie",
  "Unbehandelte Schlafapnoe",
  "Schwangerschaft",
];

type Step = "intro" | "check" | "warning" | "method";

export default function Onboarding() {
  const router = useRouter();
  const { appState } = useDb();
  const [step, setStep] = useState<Step>("intro");
  const [checked, setChecked] = useState<boolean[]>(CONTRAINDICATIONS.map(() => false));

  const anyChecked = checked.some(Boolean);
  const toggle = (i: number) =>
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  async function finish() {
    await appState.setContraindication(anyChecked);
    await appState.setOnboardingComplete(true);
    router.replace("/diary");
  }

  if (step === "intro") {
    return (
      <Screen>
        <Title>Willkommen bei WACH</Title>
        <Card>
          <Paragraph>
            WACH begleitet dich mit Methoden der kognitiven Verhaltenstherapie bei
            Schlaflosigkeit (CBT-I). Im Zentrum steht nicht, den Schlaf zu erzwingen,
            sondern die Angst vor der Schlaflosigkeit zu verlieren.
          </Paragraph>
          <Paragraph>
            Alle Daten bleiben nur auf diesem Gerät. Kein Konto, keine Cloud.
          </Paragraph>
        </Card>
        <PrimaryButton title="Weiter" onPress={() => setStep("check")} />
      </Screen>
    );
  }

  if (step === "check") {
    return (
      <Screen>
        <Title>Kurz zu deiner Gesundheit</Title>
        <Card>
          <Paragraph>
            Trifft eines der folgenden Dinge auf dich zu? Das hilft einzuschätzen, ob
            die Methode für dich ohne ärztliche Begleitung geeignet ist.
          </Paragraph>
          <View style={{ marginTop: space(2) }}>
            {CONTRAINDICATIONS.map((label, i) => (
              <CheckRow
                key={label}
                label={label}
                checked={checked[i] ?? false}
                onToggle={() => toggle(i)}
              />
            ))}
          </View>
        </Card>
        <PrimaryButton
          title="Weiter"
          onPress={() => setStep(anyChecked ? "warning" : "method")}
        />
      </Screen>
    );
  }

  if (step === "warning") {
    return (
      <Screen>
        <Title>Bitte ärztlich abklären</Title>
        <Card>
          <Subtitle>Schlaf-Restriktion ist für dich nicht ohne Weiteres geeignet.</Subtitle>
          <Paragraph>
            Bei bipolarer Störung, Epilepsie, unbehandelter Schlafapnoe oder in der
            Schwangerschaft kann eine Einschränkung der Bettzeit riskant sein. Besprich
            die Anwendung bitte zuerst mit einer Ärztin oder einem Arzt.
          </Paragraph>
          <Paragraph>
            Du kannst das Tagebuch trotzdem nutzen – das Schlaffenster wird nie unter
            5 Stunden verkürzt.
          </Paragraph>
        </Card>
        <View style={{ gap: space(3) }}>
          <PrimaryButton title="Verstanden – trotzdem fortfahren" onPress={() => setStep("method")} />
          <SecondaryButton title="Zurück" onPress={() => setStep("check")} />
        </View>
      </Screen>
    );
  }

  // method
  return (
    <Screen>
      <Title>So funktioniert's</Title>
      <Card>
        <Subtitle>1 · Aufzeichnen</Subtitle>
        <Paragraph>
          Du führst morgens und abends ein kurzes Schlaftagebuch. In der ersten Woche
          ermitteln wir daraus deinen Ausgangswert.
        </Paragraph>
      </Card>
      <Card>
        <Subtitle>2 · Schlaffenster</Subtitle>
        <Paragraph>
          Danach bekommst du ein festes Zeitfenster im Bett. Das klingt knapp, macht den
          Schlaf aber tiefer und zuverlässiger – nie unter 5 Stunden.
        </Paragraph>
      </Card>
      <Card>
        <Subtitle>3 · Anpassen</Subtitle>
        <Paragraph>
          Alle 7 Nächte justieren wir das Fenster anhand deiner Schlafeffizienz: schläfst
          du es gut aus, wird es größer.
        </Paragraph>
      </Card>
      <PrimaryButton title="Los geht's" onPress={finish} />
    </Screen>
  );
}
