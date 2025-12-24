

export const CATEGORIES_CONFIG = [
    { label: "Filler", keywords: ["필러", "레볼락스", "더채움", "쥬비덤", "주비덤", "레스틸레인", "벨로테로", "순수필", "엘라스티", "뉴라미스", "로리앙", "클레비엘", "이브아르", "테오시알", "스타일에이지", "리덴시티"] },
    { label: "Botulinum Toxin", keywords: ["톡신", "보톡스", "나보타", "제오민", "레티보", "코어톡스", "하이톡스", "비에녹스"] },
    { label: "Collagen Stimulator", keywords: ["PLLA", "PDLLA", "PLA", "쥬베룩", "레니스나", "스컬트라", "리프팅실", "실리프팅", "PDO", "에스테필"] },
    { label: "Skinboosters", keywords: ["PN", "PDRN", "엑소좀", "리쥬란", "스킨부스터", "hADM", "인체조직", "리투오", "힐로웨이브", "리바이브", "스킨바이브", "프로파일로", "비타란", "동종진피"] },
    { label: "Machines (EBD)", keywords: ["HIFU", "RF", "고주파", "레이저", "울쎄라", "써마지", "슈링크", "인모드", "올리지오", "텐써마", "브이로", "더블로", "울트라포머", "리프테라", "포텐자", "시크릿", "실펌", "온다리프팅", "큐어젯", "노보젯", "엔파인더스"] },
    { label: "Corporate News", keywords: ["제테마", "휴젤", "파마리서치", "종근당", "종근당바이오", "휴온스", "휴메딕스", "메디톡스", "바이오플러스", "원텍", "클래시스", "제이시스", "바임", "대웅제약", "갈더마", "멀츠", "앨러간", "시지바이오", "비엔씨", "엑소코", "에스테팜", "아크로스", "한스바이오베드", "비엠아이", "중헌제약", "MDR", "학회", "최소침습", "미용성형", "화장품", "제이월드", "네오닥터", "허가"] }
];

export const CATEGORIES = CATEGORIES_CONFIG.map(c => c.label);

export function groupNewsByCategory(news: any[]) {
    // 1. Initialize buckets for each category
    const buckets: Record<string, any[]> = {};
    CATEGORIES_CONFIG.forEach(config => {
        buckets[config.label] = [];
    });

    // 2. Iterate through each news article
    news.forEach(article => {
        let bestCategory = null;
        let highestScore = 0;
        let corporateNewsScore = 0; // Track specifically for fallback

        // 3. Calculate score for each category
        CATEGORIES_CONFIG.forEach(config => {
            let score = 0;

            // Priority 1: Main Keyword Exact Match (Highest Weight)
            const mainKeyword = article.main_keywords && article.main_keywords.length > 0
                ? article.main_keywords[0]
                : article.keyword;

            if (mainKeyword && config.keywords.some(k => mainKeyword === k)) {
                score += 100;
            }

            // Priority 2: Title Starts With Keyword (Strong Weight)
            if (article.title && config.keywords.some(k => article.title.startsWith(k))) {
                score += 50;
            }

            // Priority 3: Title Contains Keyword (Medium Weight)
            if (article.title && config.keywords.some(k => article.title.includes(k))) {
                score += 20;
            }

            // Priority 4: Main Keywords List Contains Keyword (Secondary Tag)
            if (article.main_keywords && article.main_keywords.some((mk: string) => config.keywords.includes(mk))) {
                score += 5;
            }

            // Priority 5: Description Match (Low Weight)
            if (article.description && config.keywords.some(k => article.description.includes(k))) {
                score += 1;
            }

            // Track Corporate News score specifically
            if (config.label === "Corporate News") {
                corporateNewsScore = score;
            }

            // Update best category if this score is higher
            if (score > 0 && score > highestScore) {
                highestScore = score;
                bestCategory = config.label;
            }
        });

        // 4. Fallback Logic: Ambiguous but relevant to Corporate News
        // If highest score is low (< 20, meaning no Title or Main Tag match) AND Corporate News has relevance
        if (highestScore < 20 && corporateNewsScore > 0) {
            bestCategory = "Corporate News";
        }

        // 5. Assign article to the best category bucket
        if (bestCategory) {
            buckets[bestCategory].push(article);
        }
    });

    return buckets;
}
