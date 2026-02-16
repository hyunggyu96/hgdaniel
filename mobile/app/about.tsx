import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Newspaper, BarChart3, Shield } from "lucide-react-native";
import { AntigravityHeader, FloatingCard, SpringPressable } from "@/components/antigravity";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  const features = [
    {
      icon: <Newspaper size={24} color={colors.primary} />,
      title: t("about_card_news"),
      desc: t("about_card_news_desc"),
    },
    {
      icon: <BarChart3 size={24} color={colors.primary} />,
      title: t("about_card_data"),
      desc: t("about_card_data_desc"),
    },
    {
      icon: <Shield size={24} color={colors.primary} />,
      title: t("about_card_policy"),
      desc: t("about_card_policy_desc"),
    },
  ];

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
          title={t("about_mission_title")}
          subtitle={t("about_mission_desc")}
        />

        {features.map((feature, index) => (
          <View key={index} style={styles.cardWrapper}>
            <FloatingCard index={index}>
              <View style={featureStyles.row}>
                <View style={featureStyles.iconWrap}>{feature.icon}</View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[featureStyles.title, { color: colors.textPrimary }]}>
                    {feature.title}
                  </Text>
                  <Text style={[featureStyles.desc, { color: colors.textSecondary }]}>
                    {feature.desc}
                  </Text>
                </View>
              </View>
            </FloatingCard>
          </View>
        ))}
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
});

const featureStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "rgba(49,130,246,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "700" },
  desc: { fontSize: 13, lineHeight: 18 },
});
