import React, { useState, useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { AntigravityHeader, SpringPressable } from "@/components/antigravity";
import { SearchInput } from "@/components/ui/SearchInput";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { CompanyData, CompanyStatus } from "@/data/companyList";
import { useCompanies } from "@/hooks/useCompanies";
import { COMPANY_OVERVIEWS } from "@/data/companyOverviews";
import { ANTIGRAVITY_SPRING, STAGGER_DELAY } from "@/theme/springs";

function StatusBadge({ status, lang }: { status: CompanyStatus; lang: string }) {
  // ... existing StatusBadge implementation unchanged ...
  const config: Record<CompanyStatus, { bg: string; color: string; label: string }> = {
    KOSPI: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6", label: "KOSPI" },
    KOSDAQ: { bg: "rgba(99,102,241,0.15)", color: "#6366f1", label: "KOSDAQ" },
    Unlisted: { bg: "rgba(156,163,175,0.15)", color: "#9ca3af", label: lang === "ko" ? "비상장" : "Unlisted" },
    Global_Listed: { bg: "rgba(139,92,246,0.15)", color: "#8b5cf6", label: "Listed" },
    Global_Private: { bg: "rgba(156,163,175,0.15)", color: "#9ca3af", label: "Private" },
  };
  const c = config[status];

  return (
    <View style={[badgeStyles.container, { backgroundColor: c.bg }]}>
      <View style={[badgeStyles.dot, { backgroundColor: c.color }]} />
      <Text style={[badgeStyles.label, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

function CompanyCard({
  company,
  index,
  lang,
}: {
  company: CompanyData;
  index: number;
  lang: string;
}) {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const overview = COMPANY_OVERVIEWS[company.name.ko];

  return (
    <Animated.View
      entering={FadeInUp.springify()
        .damping(ANTIGRAVITY_SPRING.damping!)
        .mass(ANTIGRAVITY_SPRING.mass!)
        .stiffness(ANTIGRAVITY_SPRING.stiffness!)
        .delay(index * STAGGER_DELAY)}
      style={[
        companyStyles.card,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)",
          borderColor: colors.glassBorder,
        },
      ]}
    >
      <SpringPressable
        onPress={() => router.push(`/company/${encodeURIComponent(company.name.ko)}`)}
        haptic="light"
      >
        <View style={companyStyles.inner}>
          <View style={companyStyles.avatar}>
            <Text style={companyStyles.avatarText}>
              {(lang === "ko" ? company.name.ko : company.name.en).charAt(0)}
            </Text>
          </View>
          <Text
            style={[companyStyles.name, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {lang === "ko" ? company.name.ko : company.name.en}
          </Text>
          <StatusBadge status={company.status} lang={lang} />
          {overview && (
            <Text
              style={[companyStyles.overview, { color: colors.textMuted }]}
              numberOfLines={2}
            >
              {overview}
            </Text>
          )}
        </View>
      </SpringPressable>
    </Animated.View>
  );
}

export default function CompanyScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  const { companies, loading } = useCompanies();

  const [region, setRegion] = useState<"korean" | "global">("korean");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = companies.filter((c) => c.category === region);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.ko.toLowerCase().includes(q) ||
          c.name.en.toLowerCase().includes(q)
      );
    }

    // Sort alphabetically
    list.sort((a, b) => {
      const nameA = language === 'ko' ? a.name.ko : a.name.en;
      const nameB = language === 'ko' ? b.name.ko : b.name.en;
      return nameA.localeCompare(nameB, language === 'ko' ? 'ko' : 'en');
    });

    return list;
  }, [region, searchQuery, language, companies]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }) => (
          <CompanyCard company={item} index={index} lang={language} />
        )}
        ListHeaderComponent={
          <View style={{ gap: 12 }}>
            <AntigravityHeader
              title={t("company_header")}
              subtitle={t("company_desc")}
              badge="Live"
            />
            <View style={styles.toggleRow}>
              {(["korean", "global"] as const).map((r) => (
                <SpringPressable
                  key={r}
                  onPress={() => setRegion(r)}
                  haptic="selection"
                >
                  <View
                    style={[
                      styles.toggleBtn,
                      {
                        backgroundColor:
                          region === r
                            ? colors.primary
                            : isDark
                              ? "rgba(255,255,255,0.06)"
                              : "rgba(0,0,0,0.04)",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: region === r ? "#fff" : colors.textSecondary,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {r === "korean" ? t("company_korean") : t("company_global")}
                    </Text>
                  </View>
                </SpringPressable>
              ))}
            </View>
            <View style={styles.searchRow}>
              <SearchInput value={searchQuery} onChangeText={setSearchQuery} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: colors.textMuted }}>
              {loading ? t("loading") : "No companies found"}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toggleRow: { flexDirection: "row", paddingHorizontal: 20, gap: 8 },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  searchRow: { paddingHorizontal: 20 },
  row: { paddingHorizontal: 16, gap: 12 },
  empty: { padding: 40, alignItems: "center" },
});

const badgeStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  label: { fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
});

const companyStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  inner: { padding: 14, gap: 8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(49,130,246,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#3182f6", fontSize: 16, fontWeight: "700" },
  name: { fontSize: 14, fontWeight: "700" },
  overview: { fontSize: 11, lineHeight: 15 },
});
