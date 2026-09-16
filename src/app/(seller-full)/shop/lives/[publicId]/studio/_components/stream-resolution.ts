/** 세로 방송 화면. 시청 화면이 9:16 이라 송출도 같은 비율로 내보낸다. */
export const STREAM_CANVAS = { width: 720, height: 1280 } as const;

/**
 * 카메라 화면이 세로 캔버스를 꽉 채우도록 놓을 자리.
 *
 * SDK 는 자리를 정해 주지 않으면 카메라를 캔버스 "안에" 맞춰 남는 쪽을 검게 둔다.
 * 카메라는 보통 4:3 이라 그대로 두면 위아래가 검게 남으므로, 비율을 지킨 채
 * 캔버스를 덮도록 키우고 넘치는 쪽은 밖으로 밀어 낸다. 인코더가 홀수를 싫어해 짝수로 맞춘다.
 */
export function coverCameraOnCanvas(cameraWidth: number, cameraHeight: number) {
  const scale = Math.max(
    STREAM_CANVAS.width / cameraWidth,
    STREAM_CANVAS.height / cameraHeight,
  );

  const width = toEven(cameraWidth * scale);
  const height = toEven(cameraHeight * scale);

  return {
    width,
    height,
    x: Math.round((STREAM_CANVAS.width - width) / 2),
    y: Math.round((STREAM_CANVAS.height - height) / 2),
  };
}

function toEven(value: number) {
  return Math.max(2, Math.round(value / 2) * 2);
}
