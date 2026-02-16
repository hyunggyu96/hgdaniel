import React from "react";
import { StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Star, ExternalLink } from "lucide-react-native";
import { SpringPressable } from "@/components/antigravity";
import { FloatingCard } from "@/components/antigravity";
import { useTheme } from "@/context/ThemeContext";
import { useCollections } from "@/context/CollectionContext";
import { useHaptics } from "@/hooks/useHaptics";
import { CATEGORY_COLORS } from "@/theme/colors";
import { Article } from "@/hooks/useNews";

interface NewsCardProps {
  article: Article;
  index: number;
}

export function NewsCard({ article, index }: NewsCardProps) {
  const { colors } = useTheme();
  const { isInCollection, toggleCollection } = useCollections();
  const haptics = useHaptics();
  const saved = isInCollection(article.link);
  const categoryColor =
    CATEGORY_COLORS[article.category] || colors.textMuted;

  const timeAgo = getTimeAgo(article.published_at);

  const handlePress = async () => {
    if (article.link) {
      await WebBrowser.openBrowserAsync(article.link);
    }
  };

  const handleBookmark = () => {
    haptics.medium();
    toggleCollection(article.link);
  };

  return (
    <FloatingCard index={index} noPadding>
      <SpringPressable onPress={handlePress} haptic="light">
        <View style={styles.content}>
          <View style={styles.topRow}>
            <View
              style={[styles.categoryDot, { backgroundColor: categoryColor }]}
            />
            <Text
              style={[styles.category, { color: categoryColor }]}
              numberOfLines={1}
            >
              {article.category}
            </Text>
            <Text style={[styles.time, { color: colors.textMuted }]}>
              {timeAgo}
            </Text>
          </View>

          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {article.title}
          </Text>

          {article.description && (
            <Text
              style={[styles.description, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {article.description}
            </Text>
          )}

          <View style={styles.bottomRow}>
            {article.keyword && (
              <View
                style={[
                  styles.keywordBadge,
                  { backgroundColor: `${categoryColor}15` },
                ]}
              >
                <Text style={[styles.keywordText, { color: categoryColor }]}>
                  {article.keyword}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }} />
            <SpringPressable onPress={handleBookmark} haptic="none">
              <Star
                size={18}
                color={saved ? "#f59e0b" : colors.textMuted}
                fill={saved ? "#f59e0b" : "transparent"}
              />
            </SpringPressable>
          </View>
        </View>
      </SpringPressable>
    </FloatingCard>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  category: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 11,
    marginLeft: "auto",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  keywordBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  keywordText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
