export const INSIGHTS_KEYWORDS = [
    'botulinum toxin',
    'HA filler',
    'dermal filler',
    'PN (polynucleotide)',
    'PDRN (polydeoxyribonucleotide)',
    'exosome',
    'PLLA',
    'PCL (polycaprolactone)',
    'PDLLA',
    'CaHA',
    'HIFU',
    'RF (radiofrequency)',
] as const;

const INSIGHTS_KEYWORD_ALIASES: Record<string, string[]> = {
    'botulinum toxin': ['Botulinum Toxin'],
    'HA filler': ['hyaluronic filler', 'ha filler', 'HA Filler'],
    'dermal filler': ['Dermal filler'],
    'PN (polynucleotide)': ['polynucleotide(PN)', 'PN', 'pn'],
    'PDRN (polydeoxyribonucleotide)': ['polydeoxyribonucleotide (pdrn)', 'PDRN', 'pdrn'],
    'exosome': ['Exosome'],
    'PLLA': ['plla'],
    'PCL (polycaprolactone)': ['Polycaprolactone(PCL)', 'PCL', 'polycaprolactone'],
    'PDLLA': ['pdlla'],
    'CaHA': ['caha', 'CAHA'],
    'HIFU': ['hifu'],
    'RF (radiofrequency)': ['RF', 'Radiofrequency(RF)', 'radiofrequency'],
};

function escapePostgrestArrayValue(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function getInsightsKeywordAliases(keyword: string): string[] {
    const normalized = keyword.trim();
    if (!normalized) return [];

    const aliases = INSIGHTS_KEYWORD_ALIASES[normalized] || [];
    return Array.from(new Set([normalized, ...aliases]));
}

export function buildInsightsKeywordOrFilter(keyword: string): string | null {
    const aliases = getInsightsKeywordAliases(keyword);
    if (aliases.length === 0) return null;

    return aliases
        .map((alias) => `keywords.cs.{"${escapePostgrestArrayValue(alias)}"}`)
        .join(',');
}
