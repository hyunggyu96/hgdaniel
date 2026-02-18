import React from "react";
import { Tabs } from "expo-router";
import { Newspaper, GraduationCap, Building2, CalendarDays, MoreHorizontal } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { useHaptics } from "@/hooks/useHaptics";
import { Platform } from "react-native";
import { usePreferences } from "@/context/PreferencesContext";

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { landing } = usePreferences();
  const haptics = useHaptics();

  const tabs = landing.tabPreferences || { news: true, insights: true, company: true, calendar: true };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.glassBorder,
          borderTopWidth: 0.5,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
      screenListeners={{
        tabPress: () => {
          haptics.selection();
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: tabs.news ? undefined : null,
          title: t("tab_news"),
          tabBarIcon: ({ color, size }) => (
            <Newspaper size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          href: tabs.insights ? undefined : null,
          title: t("tab_insights"),
          tabBarIcon: ({ color, size }) => (
            <GraduationCap size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="company"
        options={{
          href: tabs.company ? undefined : null,
          title: t("tab_company"),
          tabBarIcon: ({ color, size }) => (
            <Building2 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calender"
        options={{
          href: tabs.calendar ? undefined : null,
          title: t("tab_calender"),
          tabBarIcon: ({ color, size }) => (
            <CalendarDays size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t("tab_more"),
          tabBarIcon: ({ color, size }) => (
            <MoreHorizontal size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
