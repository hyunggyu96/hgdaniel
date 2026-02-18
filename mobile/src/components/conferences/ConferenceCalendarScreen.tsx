import React, { useMemo, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  ExternalLink,
  ArrowLeft,
  Calendar,
} from "lucide-react-native";
import { AntigravityHeader, FloatingCard, SpringPressable } from "@/components/antigravity";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { CONFERENCE_EVENTS_2026, ConferenceEvent } from "@/data/conferences";

interface Props {
  showBackButton?: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_KO = ["일", "월", "화", "수", "목", "금", "토"];

const COUNTRY_ACCENT: Record<string, string> = {
  USA: "#2563eb",
  France: "#0ea5e9",
  Brazil: "#16a34a",
  Thailand: "#7c3aed",
  "South Korea": "#1d4ed8",
  Monaco: "#dc2626",
  UAE: "#059669",
  Vietnam: "#ea580c",
  Indonesia: "#db2777",
  Taiwan: "#3b82f6",
  China: "#ef4444",
  "Hong Kong": "#d946ef",
  Singapore: "#06b6d4",
  India: "#f59e0b",
};

const DAY_MS = 24 * 60 * 60 * 1000;

function toDateKey(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function formatDateLabel(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
}

function eventRangeLabel(event: ConferenceEvent): string {
  const s = new Date(`${event.startDate}T00:00:00`);
  const e = new Date(`${event.endDate}T00:00:00`);
  const sLabel = `${MONTH_NAMES[s.getMonth()].slice(0, 3)} ${s.getDate()}`;
  const eLabel = `${MONTH_NAMES[e.getMonth()].slice(0, 3)} ${e.getDate()}`;
  return `${sLabel} - ${eLabel}`;
}

export default function ConferenceCalendarScreen({ showBackButton = false }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { language } = useLanguage();

  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState(
    toDateKey(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const eventMap = useMemo(() => {
    const map: Record<string, ConferenceEvent[]> = {};
    CONFERENCE_EVENTS_2026.forEach((event) => {
      let cursor = new Date(`${event.startDate}T00:00:00`).getTime();
      const end = new Date(`${event.endDate}T00:00:00`).getTime();

      while (cursor <= end) {
        const d = new Date(cursor);
        const key = toDateKey(d.getFullYear(), d.getMonth(), d.getDate());
        if (!map[key]) map[key] = [];
        map[key].push(event);
        cursor += DAY_MS;
      }
    });
    return map;
  }, []);

  const monthlyEvents = useMemo(() => {
    // Get all events that fall within the current month
    const startOfMonth = new Date(year, month, 1).getTime();
    const endOfMonth = new Date(year, month + 1, 0).getTime();

    return CONFERENCE_EVENTS_2026.filter((e) => {
      const eStart = new Date(`${e.startDate}T00:00:00`).getTime();
      const eEnd = new Date(`${e.endDate}T00:00:00`).getTime();
      // Check overlap
      return eStart <= endOfMonth && eEnd >= startOfMonth;
    }).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [year, month]);

  // Scroll to selected date or just keep state
  useEffect(() => {
    // Logic to scroll to event could go here
  }, [selectedDateKey]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const tailBlankCount = (7 - ((firstDay + daysInMonth) % 7)) % 7;

  const goPrevMonth = () => {
    if (month === 0) {
      setYear((prev) => prev - 1);
      setMonth(11);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const goNextMonth = () => {
    if (month === 11) {
      setYear((prev) => prev + 1);
      setMonth(0);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  const goToday = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDateKey(toDateKey(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {showBackButton ? (
        <View style={styles.backRow}>
          <SpringPressable onPress={() => router.back()} haptic="light">
            <View style={[styles.backBtn, { backgroundColor: colors.surface }]}>
              <ArrowLeft size={20} color={colors.textPrimary} />
            </View>
          </SpringPressable>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AntigravityHeader
          title={language === "ko" ? "캘린더" : "Calendar"}
          subtitle={language === "ko" ? "글로벌 컨퍼런스" : "Global Conferences"}
          badge="Live"
        />

        <View
          style={[
            styles.calendarCard,
            {
              backgroundColor: isDark ? "rgba(255,255,255,0.06)" : colors.surface,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <View style={styles.monthHeader}>
            <View style={styles.monthNavRow}>
              <SpringPressable onPress={goPrevMonth} haptic="selection">
                <View style={[styles.navBtn, { borderColor: colors.glassBorder }]}>
                  <ChevronLeft size={20} color={colors.textSecondary} />
                </View>
              </SpringPressable>

              <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>
                {year}.{String(month + 1).padStart(2, '0')}
              </Text>

              <SpringPressable onPress={goNextMonth} haptic="selection">
                <View style={[styles.navBtn, { borderColor: colors.glassBorder }]}>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </View>
              </SpringPressable>
            </View>

            <SpringPressable onPress={goToday} haptic="light">
              <View style={[styles.todayBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                <Text style={[styles.todayText, { color: colors.textPrimary }]}>Today</Text>
              </View>
            </SpringPressable>
          </View>

          <View style={styles.dayNameRow}>
            {(language === 'ko' ? DAY_NAMES_KO : DAY_NAMES_EN).map((name, idx) => (
              <Text
                key={name}
                style={[
                  styles.dayName,
                  {
                    color:
                      idx === 0
                        ? "#ef4444"
                        : idx === 6
                          ? "#3b82f6"
                          : colors.textMuted,
                  },
                ]}
              >
                {name}
              </Text>
            ))}
          </View>

          <View style={styles.gridWrap}>
            {Array.from({ length: firstDay }).map((_, idx) => (
              <View key={`head-empty-${idx}`} style={{ width: "14.28%", aspectRatio: 1 }} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const key = toDateKey(year, month, day);
              const dayEvents = eventMap[key] || [];
              const isSelected = selectedDateKey === key;
              const isToday = key === toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

              return (
                <SpringPressable
                  key={`day-${key}`}
                  onPress={() => setSelectedDateKey(key)}
                  haptic="selection"
                  style={{ width: "14.28%" }}
                >
                  <View
                    style={[
                      styles.dayCell,
                      {
                        backgroundColor: isSelected
                          ? isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6'
                          : "transparent",
                        borderWidth: isToday ? 1 : 0,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNum,
                        {
                          color: isToday
                            ? colors.primary
                            : colors.textPrimary,
                        }
                      ]}
                    >
                      {day}
                    </Text>

                    <View style={styles.eventListContainer}>
                      {dayEvents.slice(0, 3).map((event, idx) => {
                        const accent = COUNTRY_ACCENT[event.country.en] || colors.primary;
                        return (
                          <View key={event.id} style={[styles.eventLabel, { backgroundColor: accent }]}>
                            <Text style={styles.eventLabelText} numberOfLines={1}>
                              {event.name[language]}
                            </Text>
                          </View>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <Text style={{ fontSize: 9, color: colors.textMuted, marginTop: 1, paddingLeft: 1 }}>
                          +{dayEvents.length - 3}
                        </Text>
                      )}
                    </View>
                  </View>
                </SpringPressable>
              );
            })}

            {Array.from({ length: tailBlankCount }).map((_, idx) => (
              <View key={`tail-empty-${idx}`} style={{ width: "14.28%", height: 50 }} />
            ))}
          </View>
        </View>

        <View style={styles.sectionHead}>
          <View style={{ width: 4, height: 24, backgroundColor: colors.primary, borderRadius: 2, marginRight: 8 }} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {language === 'ko' ? '다가오는 일정' : 'Upcoming Events'}
          </Text>
          <View style={[styles.countBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>{language === 'ko' ? `총 ${monthlyEvents.length}건` : `Total ${monthlyEvents.length}`}</Text>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          {monthlyEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ color: colors.textMuted }}>{language === 'ko' ? '이 달에는 예정된 행사가 없습니다.' : 'No events in this month.'}</Text>
            </View>
          ) : (
            monthlyEvents.map((event, idx) => {
              const accent = COUNTRY_ACCENT[event.country.en] || colors.primary;
              const startDate = new Date(`${event.startDate}T00:00:00`);
              const startMonth = startDate.getMonth() + 1;
              const startDay = startDate.getDate();

              return (
                <SpringPressable
                  key={event.id}
                  onPress={() => WebBrowser.openBrowserAsync(event.url)}
                  haptic="light"
                >
                  <View style={[
                    styles.listCard,
                    {
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#fff",
                      borderColor: colors.glassBorder,
                      borderLeftColor: accent,
                    }
                  ]}>
                    <View style={styles.dateBox}>
                      <Text style={[styles.dateMonth, { color: colors.textMuted }]}>{startMonth}월</Text>
                      <Text style={[styles.dateDay, { color: colors.textPrimary }]}>{startDay}</Text>
                    </View>

                    <View style={styles.cardContent}>
                      <View style={[styles.miniBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
                        <Text style={[styles.miniBadgeText, { color: colors.textSecondary }]}>{event.series}</Text>
                      </View>
                      <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                        {event.name[language]}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MapPin size={10} color={colors.textSecondary} />
                        <Text style={{ fontSize: 10, color: colors.textSecondary }}>{event.city[language]}, {event.country[language]}</Text>
                      </View>
                    </View>

                    <ExternalLink size={14} color={colors.textMuted} />
                  </View>
                </SpringPressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backRow: { paddingHorizontal: 16, paddingVertical: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 12,
  },
  calendarCard: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  monthHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthNavRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  todayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  todayText: {
    fontSize: 12,
    fontWeight: "700",
  },
  dayNameRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
    marginBottom: 8,
  },
  dayName: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 4,
    paddingBottom: 16,
  },
  dayCell: {
    width: "100%",
    minHeight: 60,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: 1,
    marginVertical: 0,
  },
  dayNum: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 1,
    marginLeft: 2,
  },
  eventListContainer: {
    width: '100%',
    gap: 1,
  },
  eventLabel: {
    width: '100%',
    paddingVertical: 1,
    paddingHorizontal: 2,
    borderRadius: 2,
    marginBottom: 1,
  },
  eventLabelText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 10,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  countBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 6, // Thick colored border
    gap: 16,
  },
  dateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  dateDay: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  miniBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  miniBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionCount: {
    // Legacy removed
  },
  eventCard: {
    // Legacy removed
  },
  eventTopRow: {
    // Legacy removed
  },
  seriesBadge: {
    // Legacy removed
  },
  seriesText: {
    // Legacy removed
  },
  dateRange: {
    // Legacy removed
  },
  eventTitle: {
    // Legacy removed
  },
  metaRow: {
    // Legacy removed
  },
  metaText: {
    // Legacy removed
  },
  linkBtn: {
    // Legacy removed
  },
  linkText: {
    // Legacy removed
  },
});
