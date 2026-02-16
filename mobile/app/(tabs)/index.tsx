import React, { useState, useMemo, useCallback } from "react";
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
import { AntigravityHeader } from "@/components/antigravity";
import { SpringPressable } from "@/components/antigravity";
import { NewsCard } from "@/components/news/NewsCard";
import { CategoryChip } from "@/components/news/CategoryChip";
import { SearchInput } from "@/components/ui/SearchInput";
import { useNews } from "@/hooks/useNews";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCollections } from "@/context/CollectionContext";
import { useHaptics } from "@/hooks/useHaptics";
import { CATEGORIES, groupNewsByCategory } from "@/lib/constants";

type ViewMode = "overview" | "collections";

export default function NewsFeedScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const haptics = useHaptics();
  const { data: allNews, loading, error, refetch } = useNews();
  const { collections } = useCollections();

  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const grouped = useMemo(() => groupNewsByCategory(allNews), [allNews]);

  const filteredNews = useMemo(() => {
    let news = allNews;

    if (viewMode === "collections") {
      news = news.filter((a) => collections.includes(a.link));
    } else if (selectedCategory) {
      news = grouped[selectedCategory] || [];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      news = news.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.keyword?.toLowerCase().includes(q)
      );
    }

    return news;
  }, [allNews, viewMode, selectedCategory, searchQuery, grouped, collections]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      counts[cat] = grouped[cat]?.length || 0;
    });
    return counts;
  }, [grouped]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.light();
    await refetch();
    setRefreshing(false);
  }, [refetch, haptics]);

  const renderHeader = () => (
    <View style={{ gap: 12 }}>
      <AntigravityHeader
        title={t("news_section_title")}
        subtitle={t("news_section_desc")}
        badge={allNews.length}
        showPulse
      />

      {/* View Mode Toggle */}
      <View style={styles.toggleRow}>
        {(["overview", "collections"] as const).map((mode) => (
          <SpringPressable
            key={mode}
            onPress={() => {
              setViewMode(mode);
              setSelectedCategory(null);
            }}
            haptic="selection"
          >
            <View
              style={[
                styles.toggleBtn,
                {
                  backgroundColor:
                    viewMode === mode
                      ? colors.primary
                      : isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                },
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  {
                    color:
                      viewMode === mode ? "#fff" : colors.textSecondary,
                  },
                ]}
              >
                {mode === "overview"
                  ? t("news_overview")
                  : t("news_collections")}
              </Text>
            </View>
          </SpringPressable>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <SearchInput value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {/* Category Chips */}
      {viewMode === "overview" && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <CategoryChip
            label="All"
            selected={!selectedCategory}
            onPress={() => setSelectedCategory(null)}
            count={allNews.length}
          />
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              selected={selectedCategory === cat}
              onPress={() =>
                setSelectedCategory(
                  selectedCategory === cat ? null : cat
                )
              }
              count={categoryCounts[cat]}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  if (loading && allNews.length === 0) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t("loading")}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <FlatList
        data={filteredNews}
        keyExtractor={(item) => item.id || item.link}
        renderItem={({ item, index }) => (
          <View style={styles.cardWrapper}>
            <NewsCard article={item} index={index} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {viewMode === "collections"
                ? "No saved articles yet"
                : "No articles found"}
            </Text>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: 100,
          gap: 12,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
  },
  searchRow: {
    paddingHorizontal: 20,
  },
  chipRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  cardWrapper: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
});
