import keywordsData from "@/data/keywords.json";

export const CATEGORIES_CONFIG = keywordsData.categories;
export const CATEGORIES = CATEGORIES_CONFIG.map((c) => c.label);

const COMPANY_ONLY_KEYWORDS = [
  "파마리서치", "휴젤", "메디톡스", "제테마", "대웅제약", "동국제약",
  "종근당", "종근당바이오", "휴메딕스", "휴온스", "케어젠",
  "갈더마", "멀츠", "앨러간", "시지바이오", "한스바이오메드",
  "바이오플러스", "원텍", "클래시스", "제이시스메디칼", "리투오",
];

const containsKeyword = (text: string, keywords: string[]) => {
  if (!text) return false;
  return keywords.some((k) => text.includes(k));
};

export function groupNewsByCategory(news: any[]) {
  const buckets: Record<string, any[]> = {};
  CATEGORIES_CONFIG.forEach((config) => {
    buckets[config.label] = [];
  });

  const CORPORATE_IDX = CATEGORIES_CONFIG.findIndex(
    (c) => c.label === "Corporate News"
  );
  const CORPORATE_KEYWORDS = CATEGORIES_CONFIG[CORPORATE_IDX].keywords;

  news.forEach((article) => {
    if (article.category && buckets[article.category]) {
      buckets[article.category].push(article);
      return;
    }

    let bestCategory: string | null = null;
    let highestScore = 0;

    const content = `${article.title || ""} ${article.keyword || ""} ${article.description || ""}`;

    if (
      article.keyword &&
      COMPANY_ONLY_KEYWORDS.includes(article.keyword)
    ) {
      const productKeywordsInContent: string[] = [];
      CATEGORIES_CONFIG.forEach((config) => {
        if (config.label !== "Corporate News") {
          config.keywords.forEach((k) => {
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

    const mentionedCompanies = CORPORATE_KEYWORDS.filter((k) =>
      content.includes(k)
    );
    const isMultiCompany = mentionedCompanies.length >= 2;

    const categoryScores: Record<string, number> = {};

    CATEGORIES_CONFIG.forEach((config) => {
      let score = 0;
      const isCorporate = config.label === "Corporate News";

      config.keywords.forEach((k) => {
        if (article.keyword === k) score += 100;
        if (article.title?.includes(k)) score += 50;
        if (article.description?.includes(k)) score += 10;
      });

      if (isCorporate && isMultiCompany) {
        score += 150;
      }

      categoryScores[config.label] = score;

      if (score > highestScore) {
        highestScore = score;
        bestCategory = config.label;
      }
    });

    if (bestCategory === "Corporate News") {
      let bestProductCategory: string | null = null;
      let maxProductScore = 0;

      CATEGORIES_CONFIG.forEach((config) => {
        if (
          config.label !== "Corporate News" &&
          categoryScores[config.label] > maxProductScore
        ) {
          maxProductScore = categoryScores[config.label];
          bestProductCategory = config.label;
        }
      });

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
