export const COMPANY_CATEGORIES = {
  korean: [
    "한스바이오메드", "엘앤씨바이오", "제테마", "한국비엔씨", "종근당바이오",
    "휴온스", "휴온스글로벌", "휴메딕스", "휴젤", "메디톡스", "대웅제약",
    "파마리서치", "클래시스", "케어젠", "원텍", "동방메디컬", "제이시스메디칼",
    "바이오비쥬", "바이오플러스", "비올", "하이로닉", "레이저옵텍",
    "유바이오로직스", "바임글로벌", "엑소코바이오", "알에프바이오", "차메디텍",
    "JW중외제약", "동국제약", "리젠바이오텍", "울트라브이", "제노스",
  ],
  global: ["멀츠", "앨러간", "갈더마", "테옥산"],
} as const;

export type CompanyCategory = "korean" | "global";

export const getCompanyCategory = (companyName: string): CompanyCategory => {
  if ((COMPANY_CATEGORIES.korean as readonly string[]).includes(companyName))
    return "korean";
  if ((COMPANY_CATEGORIES.global as readonly string[]).includes(companyName))
    return "global";
  return "korean";
};

export const isGlobalCompany = (companyName: string): boolean => {
  return (COMPANY_CATEGORIES.global as readonly string[]).includes(companyName);
};
