/** 숫자를 1,000 단위 쉼표를 붙인 문자열로 바꾼다. */
export function formatThousand(value: number) {
  return value.toLocaleString("ko-KR");
}
