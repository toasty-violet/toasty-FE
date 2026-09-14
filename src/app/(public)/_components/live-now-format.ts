/**
 * "09.20 오후 8시". 홈 카드는 자리가 좁아 셀러 라이브탭과 달리 연도를 뺀다.
 * 오전/오후와 12시간제는 런타임 ICU 에 기대지 않고 직접 계산해, 어느 환경에서도
 * 디자인 그대로 나오게 한다.
 */
export function formatLiveStartAt(iso: string) {
  const at = new Date(iso);

  const month = String(at.getMonth() + 1).padStart(2, "0");
  const day = String(at.getDate()).padStart(2, "0");

  const hours = at.getHours();
  const meridiem = hours < 12 ? "오전" : "오후";
  // 0시와 12시는 모두 "12시" 로 적는다.
  const hour12 = hours % 12 || 12;

  return `${month}.${day} ${meridiem} ${hour12}시`;
}
