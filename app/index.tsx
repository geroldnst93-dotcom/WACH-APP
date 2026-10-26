import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { useDb } from "../src/ui/db-context";
import { colors } from "../src/ui/theme";

/** Weiche: Onboarding abgeschlossen → Tagebuch, sonst → Onboarding. */
export default function Index() {
  const { appState } = useDb();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    appState.isOnboardingComplete().then(setOnboarded);
  }, [appState]);

  if (onboarded === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.amber} />
      </View>
    );
  }

  return <Redirect href={onboarded ? "/diary" : "/onboarding"} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
});
