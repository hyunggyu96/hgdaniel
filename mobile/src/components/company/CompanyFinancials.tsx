import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/i18n/LanguageContext';
import FINANCIAL_DATA_JSON from '@/data/financial_data.json';

const FINANCIAL_DATA = FINANCIAL_DATA_JSON as Record<string, any>;

type FinancialYear = {
    revenue: string;
    operating_profit: string;
};

type FinancialHistory = Record<string, FinancialYear>;

// Helper to format money
const formatMoney = (val: number, lang: string) => {
    if (val === 0) return '-';
    if (lang !== 'ko') {
        // English simplified
        if (val >= 1000000000000) return `${(val / 1000000000000).toFixed(1)}T`;
        if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
        return `${(val / 1000000).toFixed(0)}M`;
    }

    // Korean
    const trillion = Math.floor(val / 1000000000000);
    const remainder = val % 1000000000000;
    const billion = Math.round(remainder / 100000000);

    if (trillion > 0) {
        if (billion > 0) return `${trillion}조 ${billion.toLocaleString()}억`;
        return `${trillion}조`;
    }
    return `${billion.toLocaleString()}억`;
};

export function CompanyFinancials({ companyName }: { companyName: string }) {
    const { colors, isDark } = useTheme();
    const { language } = useLanguage();

    const companyData = FINANCIAL_DATA[companyName];
    const history = companyData?.financial_history;

    if (!history) return null;

    const years = ['2022', '2023', '2024', '2025'];

    const chartData = years.map(year => {
        const d = history[year];
        if (!d || d.revenue === 'N/A') return { year, revenue: 0, profit: 0 };

        // Clean string (remove commas) and parse
        const rev = typeof d.revenue === 'string'
            ? parseFloat(d.revenue.replace(/,/g, ''))
            : d.revenue;
        const prof = typeof d.operating_profit === 'string'
            ? parseFloat(d.operating_profit.replace(/,/g, ''))
            : d.operating_profit;

        return {
            year,
            revenue: isNaN(rev) ? 0 : rev,
            profit: isNaN(prof) ? 0 : prof
        };
    });

    // Calculate scales
    const maxVal = Math.max(...chartData.map(d => d.revenue)) * 1.1 || 100; // 10% padding
    const CHART_HEIGHT = 180;
    const WIDTH = Dimensions.get('window').width - 32; // padding
    const COL_WIDTH = WIDTH / 4;

    const getX = (i: number) => (i * COL_WIDTH) + (COL_WIDTH / 2);
    const getY = (val: number) => CHART_HEIGHT - ((val / maxVal) * CHART_HEIGHT);

    const points = chartData.map((d, i) => ({
        x: getX(i),
        y: getY(d.profit),
        val: d.profit
    }));

    return (
        <View style={[styles.container, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff', borderColor: colors.glassBorder }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
                {language === 'ko' ? '재무 정보' : 'Financial History'}
            </Text>

            {/* Chart */}
            <View style={{ height: CHART_HEIGHT, marginTop: 20, marginBottom: 4 }}>
                {/* Grid Lines */}
                <View style={StyleSheet.absoluteFill}>
                    {[0, 0.25, 0.5, 0.75, 1].map(t => (
                        <View
                            key={t}
                            style={{
                                position: 'absolute',
                                top: t * CHART_HEIGHT,
                                left: 0,
                                right: 0,
                                borderTopWidth: 1,
                                borderTopColor: colors.glassBorder,
                                opacity: 0.5
                            }}
                        />
                    ))}
                </View>

                {/* Bars - Visuals Only */}
                <View style={{ flexDirection: 'row', height: '100%', alignItems: 'flex-end' }}>
                    {chartData.map((d, i) => (
                        <View key={d.year} style={{ width: COL_WIDTH, alignItems: 'center' }}>
                            <View
                                style={{
                                    width: 32,
                                    height: (d.revenue / maxVal) * CHART_HEIGHT,
                                    backgroundColor: '#60a5fa',
                                    borderTopLeftRadius: 6,
                                    borderTopRightRadius: 6,
                                }}
                            />
                        </View>
                    ))}
                </View>

                {/* Line Chart Overlay */}
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <Svg height={CHART_HEIGHT + 10} width={WIDTH} style={{ overflow: 'visible' }}>
                        {points.map((p, i) => {
                            if (i === 0) return null;
                            const prev = points[i - 1];
                            return (
                                <Line
                                    key={i}
                                    x1={prev.x}
                                    y1={prev.y}
                                    x2={p.x}
                                    y2={p.y}
                                    stroke="#10b981"
                                    strokeWidth="2"
                                />
                            );
                        })}
                        {points.map((p, i) => (
                            <Circle
                                key={i}
                                cx={p.x}
                                cy={p.y}
                                r="4"
                                fill="#10b981"
                                stroke="#fff"
                                strokeWidth="2"
                            />
                        ))}
                    </Svg>
                </View>
            </View>

            {/* X-Axis Labels */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 4 }}>
                {chartData.map((d, i) => (
                    <View key={d.year} style={{ width: COL_WIDTH, alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>{d.year}</Text>
                    </View>
                ))}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#60a5fa' }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                        {language === 'ko' ? '매출액' : 'Revenue'}
                    </Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                        {language === 'ko' ? '영업이익' : 'Op. Profit'}
                    </Text>
                </View>
            </View>

            {/* Table */}
            <View style={[styles.table, { borderTopColor: colors.glassBorder }]}>
                <View style={styles.row}>
                    <Text style={[styles.cellHeader, { color: colors.textSecondary, width: 60 }]}>
                        {language === 'ko' ? '구분' : 'Type'}
                    </Text>
                    {years.map(y => (
                        <Text key={y} style={[styles.cellHeader, { color: colors.textSecondary, flex: 1, textAlign: 'center' }]}>
                            {y}
                        </Text>
                    ))}
                </View>
                <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.glassBorder }]}>
                    <Text style={[styles.cellLabel, { color: colors.textPrimary, width: 60 }]}>
                        {language === 'ko' ? '매출' : 'Sales'}
                    </Text>
                    {chartData.map(d => (
                        <Text key={d.year} style={[styles.cellValue, { color: '#3b82f6', flex: 1 }]}>
                            {formatMoney(d.revenue, language)}
                        </Text>
                    ))}
                </View>
                <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.glassBorder }]}>
                    <Text style={[styles.cellLabel, { color: colors.textPrimary, width: 60 }]}>
                        {language === 'ko' ? '이익' : 'Profit'}
                    </Text>
                    {chartData.map(d => (
                        <Text key={d.year} style={[styles.cellValue, { color: '#10b981', flex: 1 }]}>
                            {formatMoney(d.profit, language)}
                        </Text>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginTop: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 8,
        marginBottom: 24,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '600',
    },
    table: {
        marginTop: 8,
        borderTopWidth: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    cellHeader: {
        fontSize: 12,
        fontWeight: '600',
    },
    cellLabel: {
        fontSize: 12,
        fontWeight: '700',
    },
    cellValue: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
});
