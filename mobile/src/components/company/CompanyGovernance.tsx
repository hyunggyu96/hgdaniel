import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { FloatingCard, SpringPressable } from "@/components/antigravity";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import governanceData from "@/data/governance_data.json";

const data = governanceData as Record<string, {
  largest_shareholder: string;
  ceo: string;
  parent_group: string;
  governance_type: string;
  subsidiaries: string;
  source: string;
  source_date: string;
}>;

interface Props {
  companyName: string;
}

export function CompanyGovernance({ companyName }: Props) {
  const { colors, isDark } = useTheme();
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const gov = data[companyName];
  if (!gov || (!gov.ceo && !gov.largest_shareholder && !gov.governance_type)) return null;

  const rows: { label: string; value: string }[] = [];

  if (gov.ceo) {
    rows.push({ label: language === "ko" ? "대표이사" : "CEO", value: gov.ceo });
  }
  if (gov.largest_shareholder) {
    rows.push({ label: language === "ko" ? "최대주주" : "Largest Shareholder", value: gov.largest_shareholder });
  }
  if (gov.governance_type) {
    rows.push({ label: language === "ko" ? "지배구조" : "Governance", value: gov.governance_type });
  }
  if (gov.parent_group) {
    rows.push({ label: language === "ko" ? "모그룹" : "Parent Group", value: gov.parent_group });
  }

  const hasSubsidiaries = gov.subsidiaries && gov.subsidiaries.length > 0;

  return (
    <FloatingCard index={2}>
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        GOVERNANCE
      </Text>

      <View style={styles.table}>
        {rows.map((row, idx) => (
          <View
            key={row.label}
            style={[
              styles.row,
              idx < rows.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.glassBorder },
            ]}
          >
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{row.label}</Text>
            <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{row.value}</Text>
          </View>
        ))}

        {hasSubsidiaries && (
          <View style={[styles.row, { flexDirection: "column", alignItems: "stretch" }]}>
            <SpringPressable onPress={() => setExpanded(!expanded)} haptic="selection">
              <View style={styles.subsidiaryHeader}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
                  {language === "ko" ? "자회사" : "Subsidiaries"}
                </Text>
                {expanded
                  ? <ChevronUp size={16} color={colors.textMuted} />
                  : <ChevronDown size={16} color={colors.textMuted} />}
              </View>
            </SpringPressable>
            {expanded && (
              <Text style={[styles.subsidiaryText, { color: colors.textPrimary }]}>
                {gov.subsidiaries}
              </Text>
            )}
          </View>
        )}
      </View>

      {gov.source ? (
        <Text style={[styles.sourceText, { color: colors.textMuted }]}>
          {gov.source}{gov.source_date ? ` (${gov.source_date})` : ""}
        </Text>
      ) : null}
    </FloatingCard>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  table: { gap: 0 },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    gap: 12,
    alignItems: "flex-start",
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: "600",
    width: 80,
    flexShrink: 0,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
    lineHeight: 18,
  },
  subsidiaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  subsidiaryText: {
    fontSize: 13,
    lineHeight: 20,
    paddingBottom: 4,
  },
  sourceText: {
    fontSize: 10,
    marginTop: 12,
  },
});
