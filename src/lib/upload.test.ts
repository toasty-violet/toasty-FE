import { describe, expect, it } from "vitest";

import { isRenderableImageSrc, objectKeyFromUrl } from "./upload";

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

describe("objectKeyFromUrl", () => {
  it("주소에서 sellers/ 부터를 키로 되짚는다", () => {
    expect(
      objectKeyFromUrl(
        "https://bucket.s3.ap-northeast-2.amazonaws.com/sellers/images/1/2026/09/11/9f1c.jpg",
      ),
    ).toBe("sellers/images/1/2026/09/11/9f1c.jpg");
  });

  it("presigned 쿼리는 떼어낸다", () => {
    expect(
      objectKeyFromUrl(
        "https://cdn.toasty.kr/sellers/images/1/a.jpg?X-Amz-Signature=abc",
      ),
    ).toBe("sellers/images/1/a.jpg");
  });

  it("경로에 버킷이 끼어 있어도 키만 남긴다", () => {
    expect(
      objectKeyFromUrl(
        "https://s3.amazonaws.com/my-bucket/sellers/images/1/a.jpg",
      ),
    ).toBe("sellers/images/1/a.jpg");
  });

  it("사진이 없으면 빈 문자열을 돌려준다", () => {
    expect(objectKeyFromUrl("")).toBe("");
    // 서버가 사진 없는 스토어에 null 을 준다. 예전에 여기서 터졌다.
    expect(objectKeyFromUrl(null)).toBe("");
    expect(objectKeyFromUrl(undefined)).toBe("");
  });

  it("이미 키인 값은 그대로 둔다", () => {
    expect(objectKeyFromUrl("sellers/images/1/a.jpg")).toBe(
      "sellers/images/1/a.jpg",
    );
  });
});
