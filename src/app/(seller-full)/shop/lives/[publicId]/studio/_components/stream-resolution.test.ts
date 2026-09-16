import { describe, expect, it } from "vitest";

import { STREAM_CANVAS, coverCameraOnCanvas } from "./stream-resolution";

describe("coverCameraOnCanvas", () => {
  it("9:16 카메라는 캔버스와 꼭 맞는다", () => {
    expect(coverCameraOnCanvas(720, 1280)).toEqual({
      width: 720,
      height: 1280,
      x: 0,
      y: 0,
    });
  });

  // 그냥 두면 SDK 가 안에 맞춰 위아래를 검게 둔다.
  it("4:3 세로 카메라는 좌우를 넘겨서라도 세로를 채운다", () => {
    const { width, height, x, y } = coverCameraOnCanvas(960, 1280);

    expect(height).toBe(STREAM_CANVAS.height);
    expect(width).toBeGreaterThan(STREAM_CANVAS.width);
    // 넘치는 만큼 좌우로 반씩 밀어내 가운데가 남는다.
    expect(x).toBe(Math.round((STREAM_CANVAS.width - width) / 2));
    expect(y).toBe(0);
  });

  // 9:16 보다 옆으로 넓으면 세로를 채우고 좌우가 밖으로 나간다.
  it("가로 카메라도 세로를 채운다", () => {
    const { width, height, x, y } = coverCameraOnCanvas(1280, 720);

    expect(height).toBe(STREAM_CANVAS.height);
    expect(width).toBeGreaterThan(STREAM_CANVAS.width);
    expect(x).toBeLessThan(0);
    expect(y).toBe(0);
  });

  // 9:16 보다 길쭉하면 가로를 채우고 위아래가 밖으로 나간다.
  it("더 길쭉한 카메라는 가로를 채운다", () => {
    const { width, height, x, y } = coverCameraOnCanvas(720, 1600);

    expect(width).toBe(STREAM_CANVAS.width);
    expect(height).toBeGreaterThan(STREAM_CANVAS.height);
    expect(x).toBe(0);
    expect(y).toBeLessThan(0);
  });

  it("비율은 그대로 둔다", () => {
    const { width, height } = coverCameraOnCanvas(960, 1280);

    expect(width / height).toBeCloseTo(960 / 1280, 2);
  });

  // 인코더가 홀수 폭·높이를 싫어한다.
  it("짝수로 맞춘다", () => {
    const { width, height } = coverCameraOnCanvas(1111, 1481);

    expect(width % 2).toBe(0);
    expect(height % 2).toBe(0);
  });
});
