'use client';

import { useLanguage } from '@/components/LanguageContext';

const EFFECTIVE_DATE = '2026-03-09';

export default function PrivacyPage() {
    const { language, t } = useLanguage();
    const isKo = language === 'ko';

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 md:px-8 transition-colors duration-300">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-gray-100 mb-2">
                    {t('privacy_title')}
                </h1>
                <p className="text-xs text-gray-400 mb-10">
                    {isKo ? `시행일: ${EFFECTIVE_DATE}` : `Effective: ${EFFECTIVE_DATE}`}
                </p>

                <article className="space-y-8 text-[14px] leading-relaxed text-gray-700 dark:text-gray-300">
                    {/* Intro */}
                    <p>
                        {isKo
                            ? '주식회사 코어스 (이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」을 준수하고 있습니다. 본 개인정보 처리방침은 회사가 제공하는 Aesthetic Intelligence 서비스(이하 "서비스")에 적용됩니다.'
                            : 'Coauths Inc. (hereinafter "Company") values the personal information of its users and complies with the Personal Information Protection Act (PIPA). This Privacy Policy applies to the Aesthetic Intelligence service (hereinafter "Service") provided by the Company.'}
                    </p>

                    {/* 1. Collection */}
                    <Section num={1} title={isKo ? '수집하는 개인정보 항목 및 수집 방법' : 'Information We Collect'}>
                        <table className="w-full text-[13px] border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                                    <th className="py-2 pr-4 font-bold text-gray-900 dark:text-gray-100">{isKo ? '구분' : 'Type'}</th>
                                    <th className="py-2 pr-4 font-bold text-gray-900 dark:text-gray-100">{isKo ? '수집 항목' : 'Items'}</th>
                                    <th className="py-2 font-bold text-gray-900 dark:text-gray-100">{isKo ? '수집 방법' : 'Method'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <td className="py-2 pr-4">{isKo ? '필수' : 'Required'}</td>
                                    <td className="py-2 pr-4">{isKo ? '아이디, 이메일 주소, 생년, 비밀번호(암호화 저장)' : 'Username, email address, birth year, password (encrypted)'}</td>
                                    <td className="py-2">{isKo ? '회원가입 시 이용자 직접 입력' : 'User input during registration'}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4">{isKo ? '자동 수집' : 'Auto-collected'}</td>
                                    <td className="py-2 pr-4">{isKo ? '접속 IP, 접속 일시, 서비스 이용 기록' : 'IP address, access time, service usage logs'}</td>
                                    <td className="py-2">{isKo ? '서비스 이용 과정에서 자동 생성' : 'Automatically generated during service use'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </Section>

                    {/* 2. Purpose */}
                    <Section num={2} title={isKo ? '개인정보의 수집 및 이용 목적' : 'Purpose of Collection and Use'}>
                        <ul className="list-disc list-inside space-y-1">
                            <li>{isKo ? '회원 가입 및 본인 식별' : 'Account registration and user identification'}</li>
                            <li>{isKo ? '서비스 제공 및 이용자 맞춤 콘텐츠 제공' : 'Service delivery and personalized content'}</li>
                            <li>{isKo ? '서비스 이용 관련 공지사항 전달' : 'Service-related announcements'}</li>
                            <li>{isKo ? '부정 이용 방지 및 서비스 안정성 확보' : 'Prevention of misuse and service stability'}</li>
                            <li>{isKo ? '이용자 통계 분석 (연령대 등)' : 'User statistics analysis (age demographics, etc.)'}</li>
                        </ul>
                    </Section>

                    {/* 3. Retention */}
                    <Section num={3} title={isKo ? '개인정보의 보유 및 이용 기간' : 'Retention Period'}>
                        <table className="w-full text-[13px] border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                                    <th className="py-2 pr-4 font-bold text-gray-900 dark:text-gray-100">{isKo ? '구분' : 'Type'}</th>
                                    <th className="py-2 pr-4 font-bold text-gray-900 dark:text-gray-100">{isKo ? '보유 기간' : 'Period'}</th>
                                    <th className="py-2 font-bold text-gray-900 dark:text-gray-100">{isKo ? '근거' : 'Legal Basis'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <td className="py-2 pr-4">{isKo ? '회원 정보' : 'Account info'}</td>
                                    <td className="py-2 pr-4">{isKo ? '탈퇴 후 30일' : '30 days after withdrawal'}</td>
                                    <td className="py-2">{isKo ? '부정 가입 및 악용 방지' : 'Abuse prevention'}</td>
                                </tr>
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <td className="py-2 pr-4">{isKo ? '결제 및 거래 기록' : 'Payment records'}</td>
                                    <td className="py-2 pr-4">{isKo ? '5년' : '5 years'}</td>
                                    <td className="py-2">{isKo ? '전자상거래법' : 'E-Commerce Consumer Protection Act'}</td>
                                </tr>
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <td className="py-2 pr-4">{isKo ? '소비자 불만·분쟁처리' : 'Consumer disputes'}</td>
                                    <td className="py-2 pr-4">{isKo ? '3년' : '3 years'}</td>
                                    <td className="py-2">{isKo ? '전자상거래법' : 'E-Commerce Consumer Protection Act'}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4">{isKo ? '접속 기록' : 'Access logs'}</td>
                                    <td className="py-2 pr-4">{isKo ? '3개월' : '3 months'}</td>
                                    <td className="py-2">{isKo ? '통신비밀보호법 제15조의2' : 'Telecommunications Privacy Act Art. 15-2'}</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="mt-3 text-[13px]">
                            {isKo
                                ? '보유 기간 경과 후 해당 개인정보는 지체 없이 파기합니다.'
                                : 'Personal information will be destroyed without delay after the retention period expires.'}
                        </p>
                    </Section>

                    {/* 4. Destruction */}
                    <Section num={4} title={isKo ? '개인정보의 파기 절차 및 방법' : 'Destruction Procedures'}>
                        <ul className="list-disc list-inside space-y-1">
                            <li>{isKo ? '파기 절차: 보유 기간 만료 시 자동화된 절차에 따라 삭제' : 'Procedure: Automated deletion upon retention period expiry'}</li>
                            <li>{isKo ? '파기 방법: 전자적 파일은 복구 불가능한 방법으로 영구 삭제' : 'Method: Electronic files are permanently deleted beyond recovery'}</li>
                        </ul>
                    </Section>

                    {/* 5. Third-party */}
                    <Section num={5} title={isKo ? '개인정보의 제3자 제공' : 'Third-Party Disclosure'}>
                        <p>
                            {isKo
                                ? '회사는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 의해 요구되는 경우는 예외로 합니다.'
                                : 'The Company does not provide personal information to third parties, except as required by law.'}
                        </p>
                    </Section>

                    {/* 6. Outsourcing */}
                    <Section num={6} title={isKo ? '개인정보 처리의 위탁' : 'Outsourcing of Processing'}>
                        <p>
                            {isKo
                                ? '회사는 현재 개인정보 처리를 외부에 위탁하지 않습니다. 향후 위탁이 필요한 경우 사전에 고지하겠습니다.'
                                : 'The Company does not currently outsource personal information processing. Users will be notified in advance if outsourcing becomes necessary.'}
                        </p>
                    </Section>

                    {/* 7. Rights */}
                    <Section num={7} title={isKo ? '이용자의 권리 및 행사 방법' : 'User Rights'}>
                        <p className="mb-3">{isKo ? '이용자는 「개인정보 보호법」 제35조~제37조에 따라 언제든지 다음 권리를 행사할 수 있습니다:' : 'Under Articles 35-37 of the Personal Information Protection Act (PIPA), users may exercise the following rights at any time:'}</p>
                        <table className="w-full text-[13px] border-collapse mb-3">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                                    <th className="py-2 pr-4 font-bold text-gray-900 dark:text-gray-100">{isKo ? '권리' : 'Right'}</th>
                                    <th className="py-2 pr-4 font-bold text-gray-900 dark:text-gray-100">{isKo ? '행사 방법' : 'How to Exercise'}</th>
                                    <th className="py-2 font-bold text-gray-900 dark:text-gray-100">{isKo ? '법적 근거' : 'Legal Basis'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <td className="py-2 pr-4">{isKo ? '개인정보 열람 요청' : 'Request access to personal info'}</td>
                                    <td className="py-2 pr-4">{isKo ? '이메일 (privacy@coauths.com)' : 'Email (privacy@coauths.com)'}</td>
                                    <td className="py-2">{isKo ? '개인정보 보호법 제35조' : 'PIPA Art. 35'}</td>
                                </tr>
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <td className="py-2 pr-4">{isKo ? '개인정보 정정·삭제 요청' : 'Request correction or deletion'}</td>
                                    <td className="py-2 pr-4">{isKo ? '이메일 (privacy@coauths.com)' : 'Email (privacy@coauths.com)'}</td>
                                    <td className="py-2">{isKo ? '개인정보 보호법 제36조' : 'PIPA Art. 36'}</td>
                                </tr>
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <td className="py-2 pr-4">{isKo ? '개인정보 처리정지 요청' : 'Request suspension of processing'}</td>
                                    <td className="py-2 pr-4">{isKo ? '이메일 (privacy@coauths.com)' : 'Email (privacy@coauths.com)'}</td>
                                    <td className="py-2">{isKo ? '개인정보 보호법 제37조' : 'PIPA Art. 37'}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4">{isKo ? '회원 탈퇴 (계정 삭제)' : 'Account deletion (withdrawal)'}</td>
                                    <td className="py-2 pr-4">{isKo ? '서비스 내 회원탈퇴 기능 또는 이메일' : 'In-service deletion feature or email'}</td>
                                    <td className="py-2">{isKo ? '개인정보 보호법 제36조' : 'PIPA Art. 36'}</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="text-[13px]">
                            {isKo
                                ? '권리 행사 시 본인 확인 절차를 거친 후 지체 없이 처리하며, 처리 결과를 이메일로 통지합니다.'
                                : 'Requests will be processed without delay after identity verification, and results will be communicated via email.'}
                        </p>
                    </Section>

                    {/* 8. Security */}
                    <Section num={8} title={isKo ? '개인정보 보호를 위한 기술적·관리적 대책' : 'Security Measures'}>
                        <ul className="list-disc list-inside space-y-1">
                            <li>{isKo ? '비밀번호 암호화 저장 (PBKDF2-SHA512)' : 'Password encryption (PBKDF2-SHA512)'}</li>
                            <li>{isKo ? '통신 구간 암호화 (HTTPS/TLS)' : 'Transport encryption (HTTPS/TLS)'}</li>
                            <li>{isKo ? '접근 권한 최소화 및 관리자 인증 강화' : 'Minimized access privileges and strengthened admin authentication'}</li>
                        </ul>
                    </Section>

                    {/* 9. Officer */}
                    <Section num={9} title={isKo ? '개인정보 보호책임자' : 'Privacy Officer'}>
                        <ul className="space-y-1">
                            <li><span className="font-bold">{isKo ? '성명' : 'Name'}:</span> 홍길동</li>
                            <li><span className="font-bold">{isKo ? '이메일' : 'Email'}:</span> privacy@coauths.com</li>
                        </ul>
                    </Section>

                    {/* 10. Changes */}
                    <Section num={10} title={isKo ? '개인정보 처리방침 변경' : 'Policy Changes'}>
                        <p>
                            {isKo
                                ? '본 방침은 시행일로부터 적용되며, 변경 사항이 있을 경우 서비스 내 공지 및 이메일을 통해 알려드립니다.'
                                : 'This policy is effective from the date stated above. Any changes will be announced through in-service notifications and email.'}
                        </p>
                    </Section>
                </article>
            </div>
        </main>
    );
}

function Section({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-[15px] font-extrabold text-gray-900 dark:text-gray-100 mb-3">
                {num}. {title}
            </h2>
            {children}
        </section>
    );
}
