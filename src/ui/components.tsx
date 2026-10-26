/**
 * Wiederverwendbare UI-Bausteine im WACH-Theme. Rein darstellend –
 * keine Schlaf-Logik (die lebt in src/domain).
 */
import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, space, radius, font } from "./theme";

/** Bildschirm-Grundgerüst mit dunklem Hintergrund und Scroll. */
export function Screen({ children }: { children?: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Paragraph({ children }: { children: React.ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryBtn,
        disabled && styles.btnDisabled,
        pressed && !disabled && styles.btnPressed,
      ]}
    >
      <Text style={styles.primaryBtnText}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
    >
      <Text style={styles.secondaryBtnText}>{title}</Text>
    </Pressable>
  );
}

/** Skala 0–10 als tappbare Zahlenreihe. */
export function ScaleInput({
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  value: number | null;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
}) {
  return (
    <View style={{ marginTop: space(2) }}>
      <View style={styles.scaleRow}>
        {Array.from({ length: 11 }, (_, i) => i).map((n) => {
          const active = value === n;
          return (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(n)}
              style={[styles.scaleCell, active && styles.scaleCellActive]}
            >
              <Text style={[styles.scaleText, active && styles.scaleTextActive]}>{n}</Text>
            </Pressable>
          );
        })}
      </View>
      {(lowLabel || highLabel) && (
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleHint}>{lowLabel}</Text>
          <Text style={styles.scaleHint}>{highLabel}</Text>
        </View>
      )}
    </View>
  );
}

/** Ja/Nein-Umschalter. */
export function YesNo({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.yesNoRow}>
      {[
        { label: "Ja", v: true },
        { label: "Nein", v: false },
      ].map(({ label, v }) => {
        const active = value === v;
        return (
          <Pressable
            key={label}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(v)}
            style={[styles.yesNoCell, active && styles.yesNoActive]}
          >
            <Text style={[styles.yesNoText, active && styles.yesNoTextActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Minuten-Eingabe über +/- Schritte (Standard 5-Minuten-Schritt). */
export function MinutesStepper({
  value,
  onChange,
  step = 5,
}: {
  value: number | null;
  onChange: (v: number) => void;
  step?: number;
}) {
  const current = value ?? 0;
  return (
    <View style={styles.stepperRow}>
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange(Math.max(0, current - step))}
        style={styles.stepperBtn}
      >
        <Text style={styles.stepperSign}>−</Text>
      </Pressable>
      <Text style={styles.stepperValue}>{current} min</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange(current + step)}
        style={styles.stepperBtn}
      >
        <Text style={styles.stepperSign}>+</Text>
      </Pressable>
    </View>
  );
}

export function NoteField({
  value,
  onChange,
  placeholder,
}: {
  value: string | null;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <TextInput
      style={styles.note}
      value={value ?? ""}
      onChangeText={onChange}
      placeholder={placeholder ?? "Notiz …"}
      placeholderTextColor={colors.textFaint}
      multiline
    />
  );
}

/** Kennzahl in Salbeigrün (z. B. TST, Effizienz, Fenster). */
export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

/** Ankreuz-Zeile für das Onboarding. */
export function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      style={styles.checkRow}
    >
      <View style={[styles.checkbox, checked && styles.checkboxOn]}>
        {checked && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: space(5), paddingBottom: space(12), gap: space(4) },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space(5),
    gap: space(3),
  },
  title: { color: colors.text, fontSize: font.h1, fontWeight: "700" },
  subtitle: { color: colors.text, fontSize: font.h2, fontWeight: "600" },
  label: { color: colors.textMuted, fontSize: font.body, fontWeight: "600" },
  paragraph: { color: colors.textMuted, fontSize: font.body, lineHeight: 24 },
  primaryBtn: {
    backgroundColor: colors.amber,
    borderRadius: radius.pill,
    paddingVertical: space(4),
    alignItems: "center",
  },
  primaryBtnText: { color: colors.bg, fontSize: font.body, fontWeight: "700" },
  secondaryBtn: {
    backgroundColor: "transparent",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: space(4),
    alignItems: "center",
  },
  secondaryBtnText: { color: colors.text, fontSize: font.body, fontWeight: "600" },
  btnPressed: { opacity: 0.7 },
  btnDisabled: { backgroundColor: colors.amberDim, opacity: 0.5 },
  scaleRow: { flexDirection: "row", gap: space(1.5) },
  scaleCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  scaleCellActive: { backgroundColor: colors.amber },
  scaleText: { color: colors.textMuted, fontSize: font.small, fontWeight: "600" },
  scaleTextActive: { color: colors.bg, fontWeight: "800" },
  scaleLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: space(1.5) },
  scaleHint: { color: colors.textFaint, fontSize: font.small },
  yesNoRow: { flexDirection: "row", gap: space(3), marginTop: space(2) },
  yesNoCell: {
    flex: 1,
    paddingVertical: space(3.5),
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
  },
  yesNoActive: { backgroundColor: colors.amber },
  yesNoText: { color: colors.textMuted, fontSize: font.body, fontWeight: "600" },
  yesNoTextActive: { color: colors.bg, fontWeight: "800" },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: space(2),
  },
  stepperBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperSign: { color: colors.amber, fontSize: 26, fontWeight: "700" },
  stepperValue: { color: colors.text, fontSize: font.h3, fontWeight: "700" },
  note: {
    marginTop: space(2),
    minHeight: 80,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    padding: space(3),
    color: colors.text,
    fontSize: font.body,
    textAlignVertical: "top",
  },
  metric: { alignItems: "center", gap: space(1) },
  metricValue: { color: colors.sage, fontSize: font.metric, fontWeight: "800" },
  metricLabel: { color: colors.textMuted, fontSize: font.small },
  checkRow: { flexDirection: "row", alignItems: "center", gap: space(3), paddingVertical: space(2) },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { backgroundColor: colors.amber, borderColor: colors.amber },
  checkMark: { color: colors.bg, fontWeight: "900", fontSize: 16 },
  checkLabel: { color: colors.text, fontSize: font.body, flex: 1 },
});
