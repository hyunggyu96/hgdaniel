import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { AntigravityHeader, FloatingCard, SpringPressable } from "@/components/antigravity";
import { useTheme } from "@/context/ThemeContext";

const COUNTRY_NAMES: Record<string, { ko: string; en: string }> = {
  kr: { ko: "대한민국", en: "South Korea" },
  vn: { ko: "베트남", en: "Vietnam" },
  th: { ko: "태국", en: "Thailand" },
};

export default function CountryPolicyScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { country } = useLocalSearchParams<{ country: string }>();

  const countryName = COUNTRY_NAMES[country || "kr"];

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
    >
      <View style={styles.backRow}>
        <SpringPressable onPress={() => router.back()} haptic="light">
          <View style={[styles.backBtn, { backgroundColor: colors.surface }]}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </View>
        </SpringPressable>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AntigravityHeader
          title={countryName?.ko || country || ""}
          subtitle={countryName?.en}
        />

        <View style={styles.cardWrapper}>
          <FloatingCard index={0}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              REGULATORY OVERVIEW
            </Text>
            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
              Detailed regulatory information for {countryName?.en || country} will be displayed here.
              This includes medical device classification, registration requirements, and compliance guidelines.
            </Text>
          </FloatingCard>
        </View>

        <View style={styles.cardWrapper}>
          <FloatingCard index={1}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              KEY REGULATIONS
            </Text>
            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
              Full regulatory data from the policy profiles will be rendered here in a future update.
            </Text>
          </FloatingCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backRow: { paddingHorizontal: 16, paddingVertical: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  scroll: { paddingBottom: 40, gap: 16 },
  cardWrapper: { paddingHorizontal: 16 },
  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: 8 },
  bodyText: { fontSize: 14, lineHeight: 20 },
});
