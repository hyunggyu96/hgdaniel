
import keywordsData from '../../../_shared/keywords.json';

export const CATEGORIES_CONFIG = keywordsData.categories;

export const CATEGORIES = CATEGORIES_CONFIG.map(c => c.label);

// [NEW] 기업명 단독 키워드 리스트 (이 키워드만 있으면 Corporate News)
const COMPANY_ONLY_KEYWORDS = [
    "파마리서치", "휴젤", "메디톡스", "제테마", "대웅제약", "동국제약",
    "종근당", "종근당바이오", "휴메딕스", "휴온스", "케어젠",
    "갈더마", "멀츠", "앨러간", "시지바이오", "한스바이오메드",
    "바이오플러스", "원텍", "클래시스", "제이시스메디칼", "리투오"
];

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
        // [NEW] 이미 DB에 category가 저장되어 있으면 그대로 사용
        if (article.category && buckets[article.category]) {
            buckets[article.category].push(article);
            return;
        }

        let bestCategory: string | null = null;
        let highestScore = 0;

        // 메타데이터 분석: 제목, 키워드, 설명
        const content = `${article.title || ''} ${article.keyword || ''} ${article.description || ''}`;

        // [NEW] 기업명 단독 키워드 체크 - 검색 키워드가 기업명이고, 제품 키워드가 없으면 Corporate News
        if (article.keyword && COMPANY_ONLY_KEYWORDS.includes(article.keyword)) {
            const productKeywordsInContent: string[] = [];
            CATEGORIES_CONFIG.forEach(config => {
                if (config.label !== "Corporate News") {
                    config.keywords.forEach(k => {
                        if (k !== article.keyword && content.includes(k)) {
                            productKeywordsInContent.push(k);
                        }
                    });
                }
            });
            if (productKeywordsInContent.length === 0) {
                buckets["Corporate News"].push(article);
                return;
            }
        }

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

        // Rule 2 Refinement: 회사이름 + 카테고리 키워드 -> 제품 카테고리 우선
        // 예: "메디톡스 vs 대웅제약 보톡스 전쟁" -> 회사 2개지만 "보톡스"가 있으므로 Toxin으로 분류
        // 핵심: 제목에 카테고리 키워드가 있으면 회사 개수와 상관없이 제품 카테고리 우선!

        if (bestCategory === "Corporate News") {
            // Corporate로 분류됐지만, 제품 카테고리 키워드도 있는 경우 -> 제품 카테고리로 변경 시도
            let bestProductCategory: string | null = null;
            let maxProductScore = 0;

            CATEGORIES_CONFIG.forEach(config => {
                if (config.label !== "Corporate News" && categoryScores[config.label] > maxProductScore) {
                    maxProductScore = categoryScores[config.label];
                    bestProductCategory = config.label;
                }
            });

            // 제목에 카테고리 키워드가 있으면(50점 이상) 제품 카테고리로 뺏어오기
            if (bestProductCategory && maxProductScore >= 50) {
                bestCategory = bestProductCategory;
            }
        }

        if (bestCategory) {
            buckets[bestCategory].push(article);
        }
    });

    return buckets;
}
