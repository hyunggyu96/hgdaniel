

import keywordsData from '../../../_shared/keywords.json';

export const CATEGORIES_CONFIG = keywordsData.categories;

export const CATEGORIES = CATEGORIES_CONFIG.map(c => c.label);

// Helper to check if text contains any of the keywords
const containsKeyword = (text: string, keywords: string[]) => {
    if (!text) return false;
    return keywords.some(k => text.includes(k));
};

export function groupNewsByCategory(news: any[]) {
    const buckets: Record<string, any[]> = {};
    CATEGORIES_CONFIG.forEach(config => {
        buckets[config.label] = [];
    });

    const CORPORATE_IDX = CATEGORIES_CONFIG.findIndex(c => c.label === "Corporate News");
    const CORPORATE_KEYWORDS = CATEGORIES_CONFIG[CORPORATE_IDX].keywords;

    news.forEach(article => {
        let bestCategory: string | null = null;
        let highestScore = 0;

        // 메타데이터 분석: 제목, 키워드, 설명
        const content = `${article.title || ''} ${article.keyword || ''} ${article.description || ''}`;

        // 1. 기업 키워드 발견 개수 확인 (다수 기업 언급 시 Corporate News 확률 증가)
        const mentionedCompanies = CORPORATE_KEYWORDS.filter(k => content.includes(k));
        const isMultiCompany = mentionedCompanies.length >= 2;

        let categoryScores: Record<string, number> = {};

        CATEGORIES_CONFIG.forEach(config => {
            let score = 0;
            const isCorporate = config.label === "Corporate News";

            // Keyword Matching Strategy
            config.keywords.forEach(k => {
                if (article.keyword === k) score += 100; // DB Main Keyword Exact Match
                if (article.title?.includes(k)) score += 50; // Title Match
                if (article.description?.includes(k)) score += 10; // Desc Match
            });

            // Rule Implementations:

            // Rule 3: 다수 브랜드/회사이름 나오면 Corporate News 가중치 up
            if (isCorporate && isMultiCompany) {
                score += 150; // 강력한 가중치
            }

            // Rule 1 & 2 Handling implicitly via scores:
            // 제품 키워드가 발견되면 해당 제품 카테고리 점수가 올라감.
            // 기업 키워드만 있으면 Corporate 점수만 올라감.

            categoryScores[config.label] = score;

            if (score > highestScore) {
                highestScore = score;
                bestCategory = config.label;
            }
        });

        // Rule 2 Refinement: 브랜드 + 회사이름 -> 제품 카테고리 우선
        // 만약 Corporate 점수와 제품 카테고리 점수가 경합할 때, 제품 키워드가 명확하면 제품으로 보냄.
        // 하지만 위에서 제품 키워드 점수(Title Match 50)가 누적되므로 자연스럽게 해결될 가능성 높음.
        // 예외 처리: 만약 Corporate가 1등인데, 다른 제품 카테고리 점수도 상당하다면(예: 50점 이상)?
        // -> 사용자는 "브랜드+회사이름 = 다른 성분 키워드(제품)"를 원함.
        // 따라서 제품 카테고리 점수가 0이 아니라면 Corporate보다 우선순위를 줄 필요가 있음.

        if (bestCategory === "Corporate News" && !isMultiCompany) {
            // 단일 회사가 언급되었는데, 제품 키워드도 같이 있는 경우 -> 제품 카테고리로 변경 시도
            let bestProductCategory: string | null = null;
            let maxProductScore = 0;

            CATEGORIES_CONFIG.forEach(config => {
                if (config.label !== "Corporate News" && categoryScores[config.label] > maxProductScore) {
                    maxProductScore = categoryScores[config.label];
                    bestProductCategory = config.label;
                }
            });

            // 제품 점수가 유의미하게 존재하면(예: 제목에 제품명 있음) 제품 카테고리로 뺏어오기
            if (bestProductCategory && maxProductScore >= 40) {
                bestCategory = bestProductCategory;
            }
        }

        if (bestCategory) {
            buckets[bestCategory].push(article);
        }
    });

    return buckets;
}
