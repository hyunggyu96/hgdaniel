export type CompanyStatus = "KOSPI" | "KOSDAQ" | "Unlisted" | "Global_Listed" | "Global_Private";
export type CompanyCategory = "korean" | "global";

export interface CompanyData {
  id: number;
  name: { ko: string; en: string };
  status: CompanyStatus;
  category: CompanyCategory;
}

export const allCompanies: CompanyData[] = [
  { id: 1, name: { ko: "한스바이오메드", en: "HansBiomed" }, status: "KOSDAQ", category: "korean" },
  { id: 2, name: { ko: "엘앤씨바이오", en: "L&C Bio" }, status: "KOSDAQ", category: "korean" },
  { id: 3, name: { ko: "제테마", en: "Jetema" }, status: "KOSDAQ", category: "korean" },
  { id: 4, name: { ko: "한국비엔씨", en: "BNC Korea" }, status: "KOSDAQ", category: "korean" },
  { id: 5, name: { ko: "종근당바이오", en: "Chong Kun Dang Bio" }, status: "KOSPI", category: "korean" },
  { id: 6, name: { ko: "휴온스", en: "Huons" }, status: "KOSDAQ", category: "korean" },
  { id: 7, name: { ko: "휴온스글로벌", en: "Huons Global" }, status: "KOSDAQ", category: "korean" },
  { id: 8, name: { ko: "휴메딕스", en: "Humedix" }, status: "KOSDAQ", category: "korean" },
  { id: 9, name: { ko: "휴젤", en: "Hugel" }, status: "KOSDAQ", category: "korean" },
  { id: 10, name: { ko: "메디톡스", en: "Medytox" }, status: "KOSDAQ", category: "korean" },
  { id: 11, name: { ko: "대웅제약", en: "Daewoong Pharma" }, status: "KOSPI", category: "korean" },
  { id: 12, name: { ko: "파마리서치", en: "PharmaResearch" }, status: "KOSDAQ", category: "korean" },
  { id: 13, name: { ko: "클래시스", en: "Classys" }, status: "KOSDAQ", category: "korean" },
  { id: 14, name: { ko: "케어젠", en: "Caregen" }, status: "KOSDAQ", category: "korean" },
  { id: 15, name: { ko: "원텍", en: "Wontech" }, status: "KOSDAQ", category: "korean" },
  { id: 16, name: { ko: "동방메디컬", en: "Dongbang Medical" }, status: "KOSDAQ", category: "korean" },
  { id: 17, name: { ko: "제이시스메디칼", en: "Jeisys Medical" }, status: "Unlisted", category: "korean" },
  { id: 18, name: { ko: "바이오비쥬", en: "BioBijou" }, status: "KOSDAQ", category: "korean" },
  { id: 19, name: { ko: "바이오플러스", en: "BioPlus" }, status: "KOSDAQ", category: "korean" },
  { id: 20, name: { ko: "비올", en: "Viol" }, status: "KOSDAQ", category: "korean" },
  { id: 21, name: { ko: "하이로닉", en: "Hironic" }, status: "KOSDAQ", category: "korean" },
  { id: 22, name: { ko: "레이저옵텍", en: "Laseroptek" }, status: "KOSDAQ", category: "korean" },
  { id: 23, name: { ko: "유바이오로직스", en: "EuBiologics" }, status: "KOSDAQ", category: "korean" },
  { id: 24, name: { ko: "바임글로벌", en: "Vaim Global" }, status: "Unlisted", category: "korean" },
  { id: 25, name: { ko: "엑소코바이오", en: "ExoCoBio" }, status: "Unlisted", category: "korean" },
  { id: 26, name: { ko: "알에프바이오", en: "RFBio" }, status: "Unlisted", category: "korean" },
  { id: 27, name: { ko: "차메디텍", en: "Cha Meditech" }, status: "Unlisted", category: "korean" },
  { id: 28, name: { ko: "JW중외제약", en: "JW Pharmaceutical" }, status: "KOSPI", category: "korean" },
  { id: 29, name: { ko: "동국제약", en: "Dongkook Pharmaceutical" }, status: "KOSDAQ", category: "korean" },
  { id: 30, name: { ko: "리젠바이오텍", en: "Regen Biotech" }, status: "Unlisted", category: "korean" },
  { id: 31, name: { ko: "울트라브이", en: "Ultra V" }, status: "Unlisted", category: "korean" },
  { id: 32, name: { ko: "제노스", en: "Genoss" }, status: "Unlisted", category: "korean" },
  { id: 33, name: { ko: "멀츠", en: "Merz Aesthetics" }, status: "Global_Private", category: "global" },
  { id: 34, name: { ko: "앨러간", en: "Allergan Aesthetics" }, status: "Global_Listed", category: "global" },
  { id: 35, name: { ko: "갈더마", en: "Galderma" }, status: "Global_Listed", category: "global" },
  { id: 36, name: { ko: "테옥산", en: "Teoxane" }, status: "Global_Private", category: "global" },
];
