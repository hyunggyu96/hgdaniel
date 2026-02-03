// Company Categorization: Korean vs Global
export const COMPANY_CATEGORIES = {
    korean: [
        "한스바이오메드",
        "엘앤씨바이오",
        "제테마",
        "한국비엔씨",
        "종근당바이오",
        "휴온스",
        "휴온스글로벌",
        "휴메딕스",
        "휴젤",
        "메디톡스",
        "대웅제약",
        "파마리서치",
        "클래시스",
        "케어젠",
        "원텍",
        "동방메디컬",
        "제이시스메디칼",
        "바이오비쥬",
        "바이오플러스",
        "비올",
        "하이로닉",
        "레이저옵텍",
        "유바이오로직스"
    ],
    global: [
        "바임글로벌",   // Korea-based but private
        "엑소코바이오", // KOSDAQ but limited DART data
        "멀츠",         // Germany (Merz Pharma)
        "앨러간",       // USA (Allergan/AbbVie)
        "갈더마",       // Switzerland (Galderma)
        "테옥산"        // Switzerland (Teoxane)
    ]
} as const;

export type CompanyCategory = 'korean' | 'global';

export const getCompanyCategory = (companyName: string): CompanyCategory => {
    if ((COMPANY_CATEGORIES.korean as readonly string[]).includes(companyName)) {
        return 'korean';
    }
    if ((COMPANY_CATEGORIES.global as readonly string[]).includes(companyName)) {
        return 'global';
    }
    return 'korean'; // Default fallback
};

export const isGlobalCompany = (companyName: string): boolean => {
    return (COMPANY_CATEGORIES.global as readonly string[]).includes(companyName);
};
