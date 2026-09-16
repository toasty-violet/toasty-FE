import { describe, expect, it } from "vitest";

import { fitStreamResolution } from "./stream-resolution";

describe("fitStreamResolution", () => {
  it("한도 안이면 카메라가 준 크기를 그대로 쓴다", () => {
    expect(fitStreamResolution(720, 1280)).toEqual({
      width: 720,
      height: 1280,
    });
  });

  // 비율이 달라지면 SDK 가 남는 쪽을 잘라내 화면이 확대된 것처럼 보인다.
  it("줄이더라도 카메라 비율은 그대로 둔다", () => {
    const { width, height } = fitStreamResolution(1080, 1440);

    expect(width / height).toBeCloseTo(1080 / 1440, 2);
    expect(height).toBeLessThanOrEqual(1280);
    expect(width).toBeLessThanOrEqual(720);
  });

  it("가로로 들어와도 긴 변을 1280 까지만 쓴다", () => {
    expect(fitStreamResolution(1920, 1080)).toEqual({
      width: 1280,
      height: 720,
    });
  });

  it("4:3 세로 카메라도 한도 안으로 줄인다", () => {
    expect(fitStreamResolution(960, 1280)).toEqual({ width: 720, height: 960 });
  });

  // 인코더가 홀수 폭·높이를 싫어한다.
  it("짝수로 맞춘다", () => {
    const { width, height } = fitStreamResolution(1111, 1481);

    expect(width % 2).toBe(0);
    expect(height % 2).toBe(0);
  });
});
