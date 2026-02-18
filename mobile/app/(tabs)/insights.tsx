import React, { useState, useCallback, useEffect } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { AntigravityHeader, FloatingCard, SpringPressable } from "@/components/antigravity";
import { SearchInput } from "@/components/ui/SearchInput";
import { CategoryChip } from "@/components/news/CategoryChip";
import { useInsights, Paper } from "@/hooks/useInsights";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { useHaptics } from "@/hooks/useHaptics";

const KEYWORDS = [
  "botulinum toxin", "HA filler", "PDRN", "exosome",
  "PLLA", "thread lift", "skin booster", "HIFU",
  "microneedling RF", "PRP", "mesotherapy",
];

function PaperCard({ paper, index }: { paper: Paper; index: number }) {
  const { colors } = useTheme();

  const handlePress = async () => {
    if (paper.link) {
      await WebBrowser.openBrowserAsync(paper.link);
    }
  };

  return (
    <FloatingCard index={index} noPadding>
      <SpringPressable onPress={handlePress} haptic="light">
        <View style={cardStyles.content}>
          <View style={cardStyles.topRow}>
            {paper.journal && (
              <Text
                style={[cardStyles.journal, { color: colors.primary }]}
                numberOfLines={1}
              >
                {paper.journal}
              </Text>
            )}
            {paper.publication_date && (
              <Text style={[cardStyles.date, { color: colors.textMuted }]}>
                {paper.publication_date}
              </Text>
            )}
          </View>

          <Text
            style={[cardStyles.title, { color: colors.textPrimary }]}
            numberOfLines={3}
          >
            {paper.title}
          </Text>

          {paper.abstract && (
            <Text
              style={[cardStyles.abstract, { color: colors.textSecondary }]}
              numberOfLines={3}
            >
              {paper.abstract}
            </Text>
          )}

          {paper.keywords?.length > 0 && (
            <View style={cardStyles.keywords}>
              {paper.keywords.slice(0, 3).map((kw, i) => (
                <View
                  key={i}
                  style={[
                    cardStyles.kwBadge,
                    {
                      backgroundColor: `${colors.primary}15`,
                    },
                  ]}
                >
                  <Text
                    style={[cardStyles.kwText, { color: colors.primary }]}
                  >
                    {kw}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </SpringPressable>
    </FloatingCard>
  );
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const haptics = useHaptics();

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { data, total, totalPages, loading, error, refetch } = useInsights(
    page, 20, keyword, query
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.light();
    await refetch();
    setRefreshing(false);
  }, [refetch, haptics]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearch = (text: string) => {
    setSearchInput(text);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
    >
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.cardWrapper}>
            <PaperCard paper={item} index={index} />
          </View>
        )}
        ListHeaderComponent={
          <View style={{ gap: 12 }}>
            <AntigravityHeader
              title={t("insights_title")}
              subtitle={t("insights_desc")}
              badge="Live"
            />
            <View style={styles.searchRow}>
              <SearchInput
                value={searchInput}
                onChangeText={handleSearch}
                placeholder={t("insights_search_placeholder")}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              <CategoryChip
                label={t("insights_all_topics")}
                selected={!keyword}
                onPress={() => { setKeyword(""); setPage(1); }}
              />
              {KEYWORDS.map((kw) => (
                <CategoryChip
                  key={kw}
                  label={kw}
                  selected={keyword === kw}
                  onPress={() => {
                    setKeyword(keyword === kw ? "" : kw);
                    setPage(1);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        }
        ListFooterComponent={
          totalPages > 1 ? (
            <View style={styles.pagination}>
              <SpringPressable
                onPress={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                haptic="selection"
              >
                <View style={[styles.pageBtn, { opacity: page <= 1 ? 0.3 : 1 }]}>
                  <ChevronLeft size={18} color={colors.textPrimary} />
                </View>
              </SpringPressable>
              <Text style={[styles.pageText, { color: colors.textSecondary }]}>
                {page} / {totalPages}
              </Text>
              <SpringPressable
                onPress={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                haptic="selection"
              >
                <View style={[styles.pageBtn, { opacity: page >= totalPages ? 0.3 : 1 }]}>
                  <ChevronRight size={18} color={colors.textPrimary} />
                </View>
              </SpringPressable>
            </View>
          ) : null
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Text style={{ color: colors.textMuted }}>Failed to load papers</Text>
              <Text style={{ color: colors.textMuted, marginTop: 6 }}>{error}</Text>
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={{ color: colors.textMuted }}>{t("insights_no_papers")}</Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: { paddingHorizontal: 20 },
  chipRow: { paddingHorizontal: 20, gap: 8 },
  cardWrapper: { paddingHorizontal: 16 },
  center: { padding: 40, alignItems: "center" },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingVertical: 20,
  },
  pageBtn: { padding: 8 },
  pageText: { fontSize: 14, fontWeight: "600" },
});

const cardStyles = StyleSheet.create({
  content: { padding: 16, gap: 8 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  journal: { fontSize: 11, fontWeight: "700", flex: 1 },
  date: { fontSize: 11 },
  title: { fontSize: 15, fontWeight: "700", lineHeight: 21 },
  abstract: { fontSize: 13, lineHeight: 18 },
  keywords: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 4 },
  kwBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  kwText: { fontSize: 10, fontWeight: "600" },
});
