import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DatabaseProvider } from "../src/ui/db-context";
import { colors } from "../src/ui/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: "fade",
          }}
        />
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
