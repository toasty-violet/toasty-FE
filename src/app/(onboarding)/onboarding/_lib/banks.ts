// 백엔드 Bank enum 과 순서·값을 그대로 맞춘다. code 를 API 로 보내고 label 을 화면에 띄운다.
export const BANKS = [
  { code: "KAKAO_BANK", label: "카카오뱅크" },
  { code: "NONGHYEOP", label: "농협" },
  { code: "SHINHAN", label: "신한" },
  { code: "IBK", label: "IBK기업" },
  { code: "HANA", label: "하나" },
  { code: "WOORI", label: "우리" },
  { code: "KOOKMIN", label: "국민" },
  { code: "SC_JEIL", label: "SC제일" },
  { code: "IM_BANK", label: "iM뱅크(대구)" },
  { code: "BUSAN", label: "부산" },
  { code: "GWANGJU", label: "광주" },
  { code: "SAEMAUL_GEUMGO", label: "새마을금고" },
  { code: "GYEONGNAM", label: "경남" },
  { code: "JEONBUK", label: "전북" },
  { code: "JEJU", label: "제주" },
  { code: "KDB", label: "산업" },
  { code: "POST_OFFICE", label: "우체국" },
  { code: "SHINHYEOP", label: "신협" },
  { code: "SUHYEOP", label: "수협" },
  { code: "CITI", label: "씨티" },
  { code: "K_BANK", label: "케이뱅크" },
  { code: "TOSS_BANK", label: "토스뱅크" },
  { code: "SANLIM_JOHAP", label: "산림조합" },
  { code: "SAVINGS_BANK", label: "저축은행" },
] as const;

export type BankCode = (typeof BANKS)[number]["code"];

/** 저장된 은행 코드에 해당하는 이름. 고르지 않았으면 빈 문자열 */
export function bankLabelOf(code: string) {
  return BANKS.find((bank) => bank.code === code)?.label ?? "";
}
