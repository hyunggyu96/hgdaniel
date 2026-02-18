import React, { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Building2,
  Globe,
} from "lucide-react-native";
import { AntigravityHeader, SpringPressable } from "@/components/antigravity";
import { SearchInput } from "@/components/ui/SearchInput";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import financialData from "@/data/financial_data.json";

const data = financialData as Record<string, any>;
const YEARS = ["2025", "2024", "2023", "2022"] as const;
type SortKey = "name" | "2022" | "2023" | "2024" | "2025";
type SortDir = "asc" | "desc";

interface CompanyRow {
  name: string;
  category: "korean" | "global";
  revenue: Record<string, number | null>;
  operatingProfit: Record<string, number | null>;
  yoyGrowth: number | null;
  latestRevenue: number | null;
}

const GLOBAL_COMPANIES = new Set(["멀츠", "앨러간", "갈더마", "테옥산"]);

function parseNum(val: string | undefined | null): number | null {
  if (!val || val === "N/A" || val === "-" || val === "") return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function toEok(val: number | null): number | null {
  if (val === null) return null;
  return Math.round(val / 1e8);
}

function formatEok(val: number | null): string {
  if (val === null) return "-";
  if (val === 0) return "0";
  const jo = Math.floor(Math.abs(val) / 10000);
  const eok = Math.abs(val) % 10000;
  const sign = val < 0 ? "-" : "";
  let result = "";
  if (jo > 0) result += `${jo}조 `;
  if (eok > 0) result += `${eok.toLocaleString()}억`;
  return sign + (result.trim() || "0");
}

function buildRows(): CompanyRow[] {
  return Object.entries(data).map(([name, d]: [string, any]) => {
    const fh = d.financial_history || {};
    const revenue: Record<string, number | null> = {};
    const operatingProfit: Record<string, number | null> = {};

    for (const y of YEARS) {
      revenue[y] = toEok(parseNum(fh[y]?.revenue));
      operatingProfit[y] = toEok(parseNum(fh[y]?.operating_profit));
    }

    let yoyGrowth: number | null = null;
    for (let i = 0; i < YEARS.length - 1; i++) {
      const cur = revenue[YEARS[i]];
      const prev = revenue[YEARS[i + 1]];
      if (cur !== null && prev !== null && prev !== 0) {
        yoyGrowth = ((cur - prev) / prev) * 100;
        break;
      }
    }

    let latestRevenue: number | null = null;
    for (const y of YEARS) {
      if (revenue[y] !== null) {
        latestRevenue = revenue[y];
        break;
      }
    }

    return { name, category: GLOBAL_COMPANIES.has(name) ? "global" : "korean", revenue, operatingProfit, yoyGrowth, latestRevenue };
  });
}

export default function RevenueScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState<"korean" | "global">("korean");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("2024");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const allRows = useMemo(() => buildRows(), []);
  const koreanCount = allRows.filter((r) => r.category === "korean").length;
  const globalCount = allRows.filter((r) => r.category === "global").length;

  const filteredRows = useMemo(() => {
    let rows = allRows.filter((r) => r.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q));
    }
    rows.sort((a, b) => {
      if (sortKey === "name") {
        const cmp = a.name.localeCompare(b.name, language === "ko" ? "ko" : "en");
        return sortDir === "asc" ? cmp : -cmp;
      }
      const aVal = a.revenue[sortKey];
      const bVal = b.revenue[sortKey];
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
    return rows;
  }, [allRows, activeCategory, searchQuery, sortKey, sortDir, language]);

  const totals = useMemo(() => {
    const result: Record<string, number> = {};
    for (const y of YEARS) {
      result[y] = filteredRows.reduce((sum, r) => sum + (r.revenue[y] || 0), 0);
    }
    return result;
  }, [filteredRows]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIndicator = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortDir === "desc"
      ? <ArrowDown size={10} color={colors.primary} />
      : <ArrowUp size={10} color={colors.primary} />;
  };

  const renderRow = ({ item, index }: { item: CompanyRow; index: number }) => {
    let latestOp: number | null = null;
    for (const y of YEARS) {
      if (item.operatingProfit[y] !== null) {
        latestOp = item.operatingProfit[y];
        break;
      }
    }

    return (
      <SpringPressable
        onPress={() => router.push(`/company/${encodeURIComponent(item.name)}`)}
        haptic="light"
      >
        <View style={[
          styles.row,
          {
            backgroundColor: index % 2 === 0
              ? isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"
              : "transparent",
          },
        ]}>
          <View style={styles.nameCell}>
            <View style={[styles.nameIcon, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6" }]}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: colors.textMuted }}>{item.name.slice(0, 1)}</Text>
            </View>
            <Text style={[styles.nameText, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          {YEARS.map((y) => (
            <View key={y} style={styles.numCell}>
              <Text style={{
                fontSize: 11,
                fontWeight: "600",
                color: item.revenue[y] !== null ? colors.primary : colors.textMuted,
                textAlign: "right",
              }}>
                {item.revenue[y] !== null ? formatEok(item.revenue[y]) : "-"}
              </Text>
            </View>
          ))}
          <View style={styles.numCell}>
            {item.yoyGrowth !== null ? (
              <View style={[
                styles.yoyBadge,
                { backgroundColor: item.yoyGrowth >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" },
              ]}>
                <Text style={{
                  fontSize: 10,
                  fontWeight: "800",
                  color: item.yoyGrowth >= 0 ? "#10b981" : "#ef4444",
                }}>
                  {item.yoyGrowth >= 0 ? "+" : ""}{item.yoyGrowth.toFixed(1)}%
                </Text>
              </View>
            ) : (
              <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: "right" }}>-</Text>
            )}
          </View>
        </View>
      </SpringPressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.backRow}>
        <SpringPressable onPress={() => router.back()} haptic="light">
          <View style={[styles.backBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </View>
        </SpringPressable>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <AntigravityHeader
          title={language === "ko" ? "매출 비교" : "Revenue"}
          subtitle={language === "ko" ? "DART 재무 데이터" : "DART Financial Data"}
          badge={allRows.length}
        />
      </View>

      {/* Category Toggle */}
      <View style={styles.controlsRow}>
        <View style={[styles.tabContainer, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderColor: colors.glassBorder }]}>
          {(["korean", "global"] as const).map((cat) => {
            const active = activeCategory === cat;
            const count = cat === "korean" ? koreanCount : globalCount;
            const Icon = cat === "korean" ? Building2 : Globe;
            return (
              <SpringPressable key={cat} onPress={() => setActiveCategory(cat)} haptic="selection">
                <View style={[
                  styles.tabBtn,
                  { backgroundColor: active ? (isDark ? "rgba(255,255,255,0.1)" : "#fff") : "transparent" },
                ]}>
                  <Icon size={14} color={active ? colors.primary : colors.textMuted} />
                  <Text style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: active ? colors.primary : colors.textMuted,
                  }}>
                    {cat === "korean"
                      ? (language === "ko" ? `한국 (${count})` : `Korean (${count})`)
                      : (language === "ko" ? `글로벌 (${count})` : `Global (${count})`)}
                  </Text>
                </View>
              </SpringPressable>
            );
          })}
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={language === "ko" ? "기업명 검색..." : "Search companies..."}
        />
      </View>

      {/* Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={{ minWidth: 580 }}>
          {/* Table Header */}
          <View style={[styles.headerRow, { borderBottomColor: colors.glassBorder }]}>
            <SpringPressable onPress={() => handleSort("name")} haptic="selection">
              <View style={[styles.nameCell, styles.headerCell]}>
                <Text style={[styles.headerText, { color: colors.textMuted }]}>
                  {language === "ko" ? "회사명" : "Company"}
                </Text>
                <SortIndicator column="name" />
              </View>
            </SpringPressable>
            {YEARS.map((y) => (
              <SpringPressable key={y} onPress={() => handleSort(y)} haptic="selection">
                <View style={[styles.numCell, styles.headerCell]}>
                  <Text style={[styles.headerText, { color: sortKey === y ? colors.primary : colors.textMuted }]}>
                    {y}
                  </Text>
                  <SortIndicator column={y} />
                </View>
              </SpringPressable>
            ))}
            <View style={[styles.numCell, styles.headerCell]}>
              <Text style={[styles.headerText, { color: colors.textMuted }]}>YoY</Text>
            </View>
          </View>

          {/* Table Body */}
          <FlatList
            data={filteredRows}
            keyExtractor={(item) => item.name}
            renderItem={renderRow}
            ListFooterComponent={
              filteredRows.length > 0 ? (
                <View style={[styles.totalRow, { borderTopColor: colors.glassBorder, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb" }]}>
                  <View style={styles.nameCell}>
                    <Text style={[styles.totalText, { color: colors.textPrimary }]}>
                      {language === "ko" ? "합계" : "Total"}
                    </Text>
                  </View>
                  {YEARS.map((y) => (
                    <View key={y} style={styles.numCell}>
                      <Text style={[styles.totalText, { color: colors.textPrimary, textAlign: "right" }]}>
                        {totals[y] > 0 ? formatEok(totals[y]) : "-"}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.numCell} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                  {language === "ko" ? "검색 결과가 없습니다." : "No companies found."}
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      {/* Source note */}
      <View style={[styles.sourceBar, { backgroundColor: colors.background, borderTopColor: colors.glassBorder }]}>
        <Text style={{ fontSize: 10, color: colors.textMuted, textAlign: "center" }}>
          {language === "ko"
            ? "* 매출액 단위: 억원 (원화 기준) | 데이터 출처: DART 전자공시시스템"
            : "* Revenue unit: 100M KRW | Source: DART Electronic Disclosure System"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backRow: { paddingHorizontal: 16, paddingVertical: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  controlsRow: { paddingHorizontal: 16, marginBottom: 12 },
  tabContainer: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 3 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 11 },
  headerRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, paddingVertical: 10, paddingHorizontal: 8 },
  headerCell: { flexDirection: "row", alignItems: "center", gap: 4 },
  headerText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 8 },
  nameCell: { width: 130, flexDirection: "row", alignItems: "center", gap: 8 },
  nameIcon: { width: 24, height: 24, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  nameText: { fontSize: 12, fontWeight: "600", flex: 1 },
  numCell: { width: 90, alignItems: "flex-end", justifyContent: "center" },
  yoyBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  totalRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 8, borderTopWidth: 2 },
  totalText: { fontSize: 12, fontWeight: "800" },
  emptyState: { padding: 40, alignItems: "center" },
  sourceBar: { paddingVertical: 8, paddingHorizontal: 16, borderTopWidth: 0.5 },
});
