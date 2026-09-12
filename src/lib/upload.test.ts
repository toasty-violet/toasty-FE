import { describe, expect, it } from "vitest";

import { isRenderableImageSrc } from "./upload";

describe("isRenderableImageSrc", () => {
  it("next/image 가 받는 주소는 통과시킨다", () => {
    expect(isRenderableImageSrc("https://cdn.toasty.kr/a.jpg")).toBe(true);
    expect(isRenderableImageSrc("http://localhost:9000/a.jpg")).toBe(true);
    expect(isRenderableImageSrc("blob:http://localhost/uuid")).toBe(true);
    expect(isRenderableImageSrc("/images/a.jpg")).toBe(true);
  });

  it("빈 문자열과 키만 있는 값은 거른다", () => {
    expect(isRenderableImageSrc("")).toBe(false);
    expect(isRenderableImageSrc("sellers/images/1/a.jpg")).toBe(false);
  });

  it("사진이 없는 스토어의 null 도 거른다", () => {
    expect(isRenderableImageSrc(null)).toBe(false);
    expect(isRenderableImageSrc(undefined)).toBe(false);
  });
});
