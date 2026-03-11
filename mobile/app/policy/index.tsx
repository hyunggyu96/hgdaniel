import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { AntigravityHeader, FloatingCard, SpringPressable } from "@/components/antigravity";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";

interface Country {
  code: string;
  name: { ko: string; en: string };
  flag: string;
  supported: boolean;
}

const COUNTRIES: Country[] = [
  { code: "kr", name: { ko: "대한민국", en: "South Korea" }, flag: "🇰🇷", supported: true },
  { code: "vn", name: { ko: "베트남", en: "Vietnam" }, flag: "🇻🇳", supported: true },
  { code: "th", name: { ko: "태국", en: "Thailand" }, flag: "🇹🇭", supported: true },
  { code: "jp", name: { ko: "일본", en: "Japan" }, flag: "🇯🇵", supported: false },
  { code: "cn", name: { ko: "중국", en: "China" }, flag: "🇨🇳", supported: false },
  { code: "id", name: { ko: "인도네시아", en: "Indonesia" }, flag: "🇮🇩", supported: false },
  { code: "my", name: { ko: "말레이시아", en: "Malaysia" }, flag: "🇲🇾", supported: false },
  { code: "sg", name: { ko: "싱가포르", en: "Singapore" }, flag: "🇸🇬", supported: false },
  { code: "ph", name: { ko: "필리핀", en: "Philippines" }, flag: "🇵🇭", supported: false },
  { code: "in", name: { ko: "인도", en: "India" }, flag: "🇮🇳", supported: false },
  { code: "au", name: { ko: "호주", en: "Australia" }, flag: "🇦🇺", supported: false },
  { code: "tw", name: { ko: "대만", en: "Taiwan" }, flag: "🇹🇼", supported: false },
  { code: "mm", name: { ko: "미얀마", en: "Myanmar" }, flag: "🇲🇲", supported: false },
];

function CountryItem({ country, index, lang }: { country: Country; index: number; lang: string }) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <FloatingCard index={index} noPadding>
      <SpringPressable
        onPress={() => {
          if (country.supported) {
            router.push(`/policy/${country.code}`);
          }
        }}
        haptic={country.supported ? "light" : "none"}
        disabled={!country.supported}
      >
        <View style={[itemStyles.row, { opacity: country.supported ? 1 : 0.4 }]}>
          <Text style={itemStyles.flag}>{country.flag}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[itemStyles.name, { color: colors.textPrimary }]}>
              {lang === "ko" ? country.name.ko : country.name.en}
            </Text>
          </View>
          {!country.supported && (
            <View style={[itemStyles.soonBadge, { backgroundColor: colors.surface }]}>
              <Text style={[itemStyles.soonText, { color: colors.textMuted }]}>SOON</Text>
            </View>
          )}
          {country.supported && (
            <ChevronRight size={18} color={colors.textMuted} />
          )}
        </View>
      </SpringPressable>
    </FloatingCard>
  );
}

export default function PolicyScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.backRow}>
        <SpringPressable onPress={() => router.back()} haptic="light">
          <View style={[styles.backBtn, { backgroundColor: colors.surface }]}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </View>
        </SpringPressable>
      </View>
      <FlatList
        data={COUNTRIES}
        keyExtractor={(item) => item.code}
        renderItem={({ item, index }) => (
          <View style={styles.cardWrapper}>
            <CountryItem country={item} index={index} lang={language} />
          </View>
        )}
        ListHeaderComponent={
          <AntigravityHeader
            title={t("policy_title")}
            subtitle={t("policy_desc")}
            badge={COUNTRIES.length}
          />
        }
        contentContainerStyle={{ paddingBottom: 40, gap: 8 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backRow: { paddingHorizontal: 16, paddingVertical: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  cardWrapper: { paddingHorizontal: 16 },
});

const itemStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  flag: { fontSize: 28 },
  name: { fontSize: 16, fontWeight: "600" },
  soonBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  soonText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
});
