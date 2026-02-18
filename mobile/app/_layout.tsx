import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { CollectionProvider } from "@/context/CollectionContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function InnerLayout() {
  const { colors } = useTheme();

  return (
    <>
      <StatusBar style={colors.statusBar} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="company/[name]"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="policy/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="policy/[country]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="conferences/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="about"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <LanguageProvider>
          <PreferencesProvider>
            <CollectionProvider>
              <InnerLayout />
            </CollectionProvider>
          </PreferencesProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
