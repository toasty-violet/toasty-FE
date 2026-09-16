/** BASIC 채널이 받는 한도. 긴 변과 짧은 변 각각을 넘지 않아야 한다. */
const MAX_LONG_SIDE = 1280;
const MAX_SHORT_SIDE = 720;

/**
 * 카메라가 주는 비율 그대로 송출 해상도를 잡는다.
 *
 * SDK 캔버스 비율이 카메라와 다르면 남는 쪽을 잘라내 화면이 확대된 것처럼 보인다.
 * 그래서 비율은 카메라를 따르고, 채널 한도에 맞게 크기만 줄인다.
 * 인코더가 홀수 폭·높이를 싫어하므로 짝수로 맞춘다.
 */
export function fitStreamResolution(width: number, height: number) {
  const longSide = Math.max(width, height);
  const shortSide = Math.min(width, height);
  const scale = Math.min(
    1,
    MAX_LONG_SIDE / longSide,
    MAX_SHORT_SIDE / shortSide,
  );

  return {
    width: toEven(width * scale),
    height: toEven(height * scale),
  };
}

function toEven(value: number) {
  return Math.max(2, Math.round(value / 2) * 2);
}
