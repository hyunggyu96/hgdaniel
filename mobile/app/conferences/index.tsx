import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ArrowLeft, MapPin, Calendar } from "lucide-react-native";
import { AntigravityHeader, FloatingCard, SpringPressable } from "@/components/antigravity";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";

// Minimal conference data for v1
const CONFERENCES = [
  { id: "1", name: "IMCAS World Congress 2026", date: "Jan 29 - 31", location: "Paris, France", series: "IMCAS" },
  { id: "2", name: "AMWC Monaco 2026", date: "Mar 26 - 28", location: "Monaco", series: "AMWC" },
  { id: "3", name: "AACS 2026", date: "Jan 15 - 18", location: "Miami, USA", series: "AACS" },
  { id: "4", name: "ISDS 2026 Spring", date: "Mar 18 - 22", location: "Honolulu, USA", series: "ISDS" },
  { id: "5", name: "AMWC Asia 2026", date: "Jun 17 - 19", location: "Singapore", series: "AMWC" },
  { id: "6", name: "IMCAS Asia 2026", date: "Jul 24 - 26", location: "Bangkok, Thailand", series: "IMCAS" },
  { id: "7", name: "KSAPS Annual 2026", date: "Apr 10 - 12", location: "Seoul, Korea", series: "KSAPS" },
  { id: "8", name: "FACE Conference 2026", date: "May 8 - 10", location: "London, UK", series: "FACE" },
  { id: "9", name: "DASIL Annual 2026", date: "Jul 16 - 18", location: "Seoul, Korea", series: "DASIL" },
  { id: "10", name: "SWAM 2026", date: "Sep 4 - 6", location: "Bangkok, Thailand", series: "SWAM" },
];

function ConferenceCard({ item, index }: { item: typeof CONFERENCES[0]; index: number }) {
  const { colors } = useTheme();

  return (
    <FloatingCard index={index} noPadding>
      <View style={cardStyles.content}>
        <View style={[cardStyles.seriesBadge, { backgroundColor: `${colors.primary}15` }]}>
          <Text style={[cardStyles.seriesText, { color: colors.primary }]}>
            {item.series}
          </Text>
        </View>
        <Text style={[cardStyles.name, { color: colors.textPrimary }]}>
          {item.name}
        </Text>
        <View style={cardStyles.detailRow}>
          <Calendar size={14} color={colors.textMuted} />
          <Text style={[cardStyles.detail, { color: colors.textSecondary }]}>
            {item.date}
          </Text>
        </View>
        <View style={cardStyles.detailRow}>
          <MapPin size={14} color={colors.textMuted} />
          <Text style={[cardStyles.detail, { color: colors.textSecondary }]}>
            {item.location}
          </Text>
        </View>
      </View>
    </FloatingCard>
  );
}

export default function ConferencesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.backRow}>
        <SpringPressable onPress={() => router.back()} haptic="light">
          <View
            style={[
              styles.backBtn,
              { backgroundColor: colors.surface },
            ]}
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </View>
        </SpringPressable>
      </View>
      <FlatList
        data={CONFERENCES}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.cardWrapper}>
            <ConferenceCard item={item} index={index} />
          </View>
        )}
        ListHeaderComponent={
          <AntigravityHeader
            title={t("nav_conferences")}
            badge={CONFERENCES.length}
          />
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
    width: 40, height: 40, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  cardWrapper: { paddingHorizontal: 16 },
});

const cardStyles = StyleSheet.create({
  content: { padding: 16, gap: 8 },
  seriesBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  seriesText: { fontSize: 11, fontWeight: "700" },
  name: { fontSize: 16, fontWeight: "700" },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  detail: { fontSize: 13 },
});
