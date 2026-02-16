import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ArrowLeft, ExternalLink } from "lucide-react-native";
import { AntigravityHeader, FloatingCard, SpringPressable } from "@/components/antigravity";
import { useCompanyNews } from "@/hooks/useCompanyNews";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { COMPANY_OVERVIEWS } from "@/data/companyOverviews";
import { allCompanies } from "@/data/companyList";

export default function CompanyDetailScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();

  const companyName = decodeURIComponent(name || "");
  const company = allCompanies.find((c) => c.name.ko === companyName);
  const overview = COMPANY_OVERVIEWS[companyName];
  const { data: headlines, loading } = useCompanyNews(companyName);

  const displayName =
    language === "ko"
      ? company?.name.ko || companyName
      : company?.name.en || companyName;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
    >
      {/* Back Button */}
      <View style={styles.backRow}>
        <SpringPressable onPress={() => router.back()} haptic="light">
          <View
            style={[
              styles.backBtn,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)",
              },
            ]}
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </View>
        </SpringPressable>
      </View>

      <FlatList
        data={headlines}
        keyExtractor={(item) => item.id || item.link}
        renderItem={({ item, index }) => (
          <View style={styles.cardWrapper}>
            <FloatingCard index={index} noPadding>
              <SpringPressable
                onPress={() =>
                  item.link && WebBrowser.openBrowserAsync(item.link)
                }
                haptic="light"
              >
                <View style={styles.headlineItem}>
                  <Text
                    style={[styles.headlineTitle, { color: colors.textPrimary }]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <View style={styles.headlineRow}>
                    <Text style={[styles.headlineDate, { color: colors.textMuted }]}>
                      {new Date(item.published_at).toLocaleDateString("ko-KR")}
                    </Text>
                    <ExternalLink size={14} color={colors.textMuted} />
                  </View>
                </View>
              </SpringPressable>
            </FloatingCard>
          </View>
        )}
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
            <AntigravityHeader
              title={displayName}
              subtitle={company?.status}
              badge={headlines.length}
            />

            {overview && (
              <View style={styles.cardWrapper}>
                <FloatingCard index={0}>
                  <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                    OVERVIEW
                  </Text>
                  <Text style={[styles.overviewText, { color: colors.textSecondary }]}>
                    {overview}
                  </Text>
                </FloatingCard>
              </View>
            )}

            <View style={styles.cardWrapper}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Recent Headlines
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: colors.textMuted }}>
              {loading ? "Loading..." : "No recent headlines"}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40, gap: 12 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backRow: { paddingHorizontal: 16, paddingVertical: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardWrapper: { paddingHorizontal: 16 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  overviewText: { fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  headlineItem: { padding: 16, gap: 6 },
  headlineTitle: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  headlineRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headlineDate: { fontSize: 12 },
  empty: { padding: 40, alignItems: "center" },
});
