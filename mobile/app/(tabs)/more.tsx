import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Shield,
  Calendar,
  Info,
  Globe,
  Moon,
  Sun,
  Smartphone,
  ChevronRight,
} from "lucide-react-native";
import { AntigravityHeader, FloatingCard, SpringPressable } from "@/components/antigravity";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";

function MenuItem({
  icon,
  label,
  onPress,
  trailing,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  trailing?: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <SpringPressable onPress={onPress} haptic="light">
      <View style={menuStyles.item}>
        <View style={menuStyles.iconWrap}>{icon}</View>
        <Text style={[menuStyles.label, { color: colors.textPrimary }]}>
          {label}
        </Text>
        <View style={{ flex: 1 }} />
        {trailing || <ChevronRight size={18} color={colors.textMuted} />}
      </View>
    </SpringPressable>
  );
}

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, mode, setMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();

  const themeOptions: Array<{ key: "light" | "dark" | "system"; label: string; icon: React.ReactNode }> = [
    { key: "light", label: t("more_theme_light"), icon: <Sun size={14} color={colors.textSecondary} /> },
    { key: "dark", label: t("more_theme_dark"), icon: <Moon size={14} color={colors.textSecondary} /> },
    { key: "system", label: t("more_theme_system"), icon: <Smartphone size={14} color={colors.textSecondary} /> },
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AntigravityHeader title={t("more_title")} />

        {/* Navigation */}
        <FloatingCard index={0} noPadding>
          <MenuItem
            icon={<Shield size={20} color={colors.primary} />}
            label={t("nav_policy")}
            onPress={() => router.push("/policy")}
          />
          <View style={[menuStyles.divider, { backgroundColor: colors.glassBorder }]} />
          <MenuItem
            icon={<Calendar size={20} color={colors.primary} />}
            label={t("nav_conferences")}
            onPress={() => router.push("/conferences")}
          />
          <View style={[menuStyles.divider, { backgroundColor: colors.glassBorder }]} />
          <MenuItem
            icon={<Info size={20} color={colors.primary} />}
            label={t("nav_about")}
            onPress={() => router.push("/about")}
          />
        </FloatingCard>

        {/* Language */}
        <FloatingCard index={1} noPadding>
          <MenuItem
            icon={<Globe size={20} color={colors.primary} />}
            label={t("more_language")}
            onPress={() => setLanguage(language === "ko" ? "en" : "ko")}
            trailing={
              <View style={menuStyles.toggleRow}>
                {(["ko", "en"] as const).map((lang) => (
                  <SpringPressable
                    key={lang}
                    onPress={() => setLanguage(lang)}
                    haptic="selection"
                  >
                    <View
                      style={[
                        menuStyles.toggleBtn,
                        {
                          backgroundColor:
                            language === lang
                              ? colors.primary
                              : isDark
                              ? "rgba(255,255,255,0.06)"
                              : "rgba(0,0,0,0.04)",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: language === lang ? "#fff" : colors.textMuted,
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        {lang === "ko" ? "한국어" : "EN"}
                      </Text>
                    </View>
                  </SpringPressable>
                ))}
              </View>
            }
          />
        </FloatingCard>

        {/* Theme */}
        <FloatingCard index={2} noPadding>
          <View style={menuStyles.themeSection}>
            <Text style={[menuStyles.sectionTitle, { color: colors.textSecondary }]}>
              {t("more_theme")}
            </Text>
            <View style={menuStyles.themeRow}>
              {themeOptions.map((opt) => (
                <SpringPressable
                  key={opt.key}
                  onPress={() => setMode(opt.key)}
                  haptic="selection"
                >
                  <View
                    style={[
                      menuStyles.themeBtn,
                      {
                        backgroundColor:
                          mode === opt.key
                            ? `${colors.primary}20`
                            : isDark
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(0,0,0,0.03)",
                        borderColor:
                          mode === opt.key
                            ? colors.primary
                            : "transparent",
                      },
                    ]}
                  >
                    {opt.icon}
                    <Text
                      style={{
                        color:
                          mode === opt.key
                            ? colors.primary
                            : colors.textSecondary,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {opt.label}
                    </Text>
                  </View>
                </SpringPressable>
              ))}
            </View>
          </View>
        </FloatingCard>

        {/* Version */}
        <Text style={[styles.version, { color: colors.textMuted }]}>
          Aesthetic Intelligence v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 100, gap: 16 },
  version: { textAlign: "center", fontSize: 12, marginTop: 8 },
});

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(49,130,246,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  label: { fontSize: 15, fontWeight: "600" },
  divider: { height: 0.5, marginLeft: 60 },
  toggleRow: { flexDirection: "row", gap: 6 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  themeSection: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  themeRow: { flexDirection: "row", gap: 8 },
  themeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
});
