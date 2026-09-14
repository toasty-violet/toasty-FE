/** 숫자를 1,000 단위 쉼표를 붙인 문자열로 바꾼다. */
export function formatThousand(value: number) {
  return value.toLocaleString("ko-KR");
}

/**
 * 집계 수치를 단위와 함께 적는다. 아직 값이 없는 것(0)과 못 받아온 것(null)은
 * 숫자 자리만 "-" 로 바꾼다. 0 건·0 원을 그대로 적으면 실적이 아니라 오류로
 * 읽히지만, 단위는 남겨야 무엇을 세는 자리인지 알 수 있다.
 */
export function formatCountOrDash(value: number | null | undefined, unit = "") {
  const isEmpty = value === null || value === undefined || value === 0;

  return `${isEmpty ? "-" : formatThousand(value)}${unit}`;
}
