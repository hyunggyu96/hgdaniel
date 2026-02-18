import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ArrowLeft, ExternalLink, AlertTriangle } from "lucide-react-native";
import { AntigravityHeader, FloatingCard, SpringPressable } from "@/components/antigravity";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import type { CountryPolicyProfile, PolicyCategory, PolicyConfidence } from "@/data/policyTypes";
import { koreaPolicyProfile } from "@/data/korea_policy_profile";
import { vietnamPolicyProfile } from "@/data/vietnam_policy_profile";
import { thailandPolicyProfile } from "@/data/thailand_policy_profile";

const PROFILES: Record<string, CountryPolicyProfile> = {
  kr: koreaPolicyProfile,
  vn: vietnamPolicyProfile,
  th: thailandPolicyProfile,
};

const CATEGORY_TABS: { key: PolicyCategory; ko: string; en: string }[] = [
  { key: "common", ko: "공통", en: "Common" },
  { key: "device", ko: "의료기기", en: "Device" },
  { key: "drug", ko: "의약품", en: "Drug" },
  { key: "cosmetic", ko: "화장품", en: "Cosmetic" },
];

const CONFIDENCE_COLORS: Record<PolicyConfidence, string> = {
  high: "#10b981",
  medium: "#f59e0b",
  low: "#ef4444",
};

const KIND_COLORS: Record<string, string> = {
  Law: "#3b82f6",
  Decree: "#8b5cf6",
  Circular: "#f59e0b",
  Notice: "#06b6d4",
  Portal: "#10b981",
};

export default function CountryPolicyScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const { country } = useLocalSearchParams<{ country: string }>();

  const profile = PROFILES[country || "kr"];
  const [activeTab, setActiveTab] = useState<PolicyCategory>("common");

  const availableTabs = useMemo(() => {
    if (!profile) return [];
    const cats = new Set(profile.facts.map((f) => f.category || "common"));
    return CATEGORY_TABS.filter((t) => cats.has(t.key));
  }, [profile]);

  const filteredFacts = useMemo(() => {
    if (!profile) return [];
    return profile.facts.filter((f) => (f.category || "common") === activeTab);
  }, [profile, activeTab]);

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.backRow}>
          <SpringPressable onPress={() => router.back()} haptic="light">
            <View style={[styles.backBtn, { backgroundColor: colors.surface }]}>
              <ArrowLeft size={20} color={colors.textPrimary} />
            </View>
          </SpringPressable>
        </View>
        <View style={styles.emptyState}>
          <Text style={{ color: colors.textMuted }}>
            {language === "ko" ? "데이터가 준비 중입니다." : "Data coming soon."}
          </Text>
        </View>
      </View>
    );
  }

  const lang = language as "ko" | "en";

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.backRow}>
        <SpringPressable onPress={() => router.back()} haptic="light">
          <View style={[styles.backBtn, { backgroundColor: colors.surface }]}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </View>
        </SpringPressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AntigravityHeader
          title={profile.countryName[lang]}
          subtitle={language === "ko" ? "규제 정보" : "Regulatory Info"}
        />

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }}>
          <View style={styles.tabRow}>
            {availableTabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <SpringPressable key={tab.key} onPress={() => setActiveTab(tab.key)} haptic="selection">
                  <View style={[
                    styles.tab,
                    {
                      backgroundColor: active ? colors.primary : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    },
                  ]}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: active ? "#fff" : colors.textSecondary,
                    }}>
                      {tab[lang]}
                    </Text>
                  </View>
                </SpringPressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Facts */}
        <View style={styles.cardGroup}>
          {filteredFacts.map((fact, idx) => (
            <FloatingCard key={fact.id} index={idx}>
              <View style={styles.factHeader}>
                <Text style={[styles.factLabel, { color: colors.textPrimary }]}>
                  {fact.label[lang]}
                </Text>
                <View style={[styles.confidenceBadge, { backgroundColor: `${CONFIDENCE_COLORS[fact.confidence]}20` }]}>
                  <View style={[styles.confidenceDot, { backgroundColor: CONFIDENCE_COLORS[fact.confidence] }]} />
                  <Text style={{ fontSize: 9, fontWeight: "700", color: CONFIDENCE_COLORS[fact.confidence] }}>
                    {fact.confidence.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={[styles.factValue, { color: colors.textSecondary }]}>
                {fact.value[lang]}
              </Text>

              {fact.note && (
                <View style={[styles.noteBox, { backgroundColor: isDark ? "rgba(245,158,11,0.1)" : "#FFFBEB" }]}>
                  <AlertTriangle size={12} color="#f59e0b" />
                  <Text style={[styles.noteText, { color: isDark ? "#fbbf24" : "#92400e" }]}>
                    {fact.note[lang]}
                  </Text>
                </View>
              )}

              {fact.references.length > 0 && (
                <View style={styles.refRow}>
                  {fact.references.map((ref) => (
                    <SpringPressable
                      key={ref.id}
                      onPress={() => WebBrowser.openBrowserAsync(ref.url)}
                      haptic="light"
                    >
                      <View style={[styles.refChip, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                        <ExternalLink size={10} color={colors.textMuted} />
                        <Text style={{ fontSize: 10, color: colors.textMuted }} numberOfLines={1}>
                          {ref.title}
                        </Text>
                      </View>
                    </SpringPressable>
                  ))}
                </View>
              )}
            </FloatingCard>
          ))}
        </View>

        {/* Key Regulations */}
        {profile.keyRegulations.length > 0 && (
          <FloatingCard index={filteredFacts.length}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              {language === "ko" ? "주요 법령" : "KEY REGULATIONS"}
            </Text>
            <View style={{ gap: 12 }}>
              {profile.keyRegulations.map((reg) => (
                <SpringPressable
                  key={reg.id}
                  onPress={() => WebBrowser.openBrowserAsync(reg.sourceUrl)}
                  haptic="light"
                >
                  <View style={[styles.regItem, { borderColor: colors.glassBorder }]}>
                    <View style={styles.regHeader}>
                      <View style={[styles.kindBadge, { backgroundColor: `${KIND_COLORS[reg.kind] || colors.primary}20` }]}>
                        <Text style={{ fontSize: 9, fontWeight: "800", color: KIND_COLORS[reg.kind] || colors.primary }}>
                          {reg.kind}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 10, color: colors.textMuted }}>{reg.documentNo}</Text>
                    </View>
                    <Text style={[styles.regTitle, { color: colors.textPrimary }]}>{reg.title}</Text>
                    <Text style={[styles.regSummary, { color: colors.textSecondary }]}>
                      {reg.summary[lang]}
                    </Text>
                    <View style={styles.regFooter}>
                      <Text style={{ fontSize: 10, color: colors.textMuted }}>{reg.authority}</Text>
                      <ExternalLink size={12} color={colors.textMuted} />
                    </View>
                  </View>
                </SpringPressable>
              ))}
            </View>
          </FloatingCard>
        )}

        {/* Disclaimers */}
        {profile.disclaimers.length > 0 && (
          <View style={[styles.disclaimerBox, { backgroundColor: isDark ? "rgba(245,158,11,0.08)" : "#FFFBEB", borderColor: isDark ? "rgba(245,158,11,0.2)" : "#FDE68A" }]}>
            <AlertTriangle size={14} color="#f59e0b" />
            <View style={{ flex: 1, gap: 4 }}>
              {profile.disclaimers.map((d, i) => (
                <Text key={i} style={{ fontSize: 11, lineHeight: 16, color: isDark ? "#fbbf24" : "#92400e" }}>
                  {d[lang]}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          {language === "ko" ? `최종 업데이트: ${profile.lastUpdated}` : `Last updated: ${profile.lastUpdated}`}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backRow: { paddingHorizontal: 16, paddingVertical: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  tabRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14 },
  cardGroup: { gap: 12 },
  factHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 },
  factLabel: { fontSize: 14, fontWeight: "700", lineHeight: 20, flex: 1 },
  confidenceBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexShrink: 0 },
  confidenceDot: { width: 6, height: 6, borderRadius: 3 },
  factValue: { fontSize: 13, lineHeight: 20 },
  noteBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 10, borderRadius: 10, marginTop: 10 },
  noteText: { fontSize: 12, lineHeight: 18, flex: 1 },
  refRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  refChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 },
  regItem: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 6 },
  regHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  kindBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  regTitle: { fontSize: 13, fontWeight: "700" },
  regSummary: { fontSize: 12, lineHeight: 18 },
  regFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  disclaimerBox: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  footerText: { fontSize: 11, textAlign: "center", marginTop: 8 },
});
