import axios from "axios";

import { apiClient } from "@/lib/api-client";
import type { ShopImageUploadUrlResponse } from "@/types/upload";

/**
 * next/image 의 src 로 넘겨도 되는 주소인지.
 *
 * next/image 는 절대주소(http…)나 "/" 로 시작하는 경로만 받고, 그 밖의 값은
 * 렌더링 중 예외를 던진다. 서버가 빈 문자열이나 키만 내려주는 경우가 있어
 * 그릴 수 있는지 먼저 가른다.
 */
export function isRenderableImageSrc(
  src: string | null | undefined,
): src is string {
  if (!src) return false;

  return /^(https?:\/\/|blob:|data:|\/)/.test(src);
}

/**
 * 사진 주소에서 S3 objectKey 를 되짚는다.
 *
 * 수정 API 는 사진을 바꾸지 않아도 objectKey 를 요구하는데, 조회는 주소만
 * 내려준다. 주소는 키를 그대로 경로에 담고 있어(.../sellers/images/1/...jpg)
 * 앞의 호스트와 뒤의 쿼리를 떼면 키가 나온다.
 */
export function objectKeyFromUrl(imageUrl: string | null | undefined) {
  // 사진을 등록하지 않은 스토어는 서버가 null 을 준다.
  if (!imageUrl) return "";

  try {
    // presigned 주소면 서명이 쿼리에 붙어 있어 경로만 취한다.
    const { pathname } = new URL(imageUrl);
    // 버킷이 경로에 들어가는 형식(.../bucket/sellers/...)까지 감안해 키 시작점을 찾는다.
    const start = pathname.indexOf("/sellers/");
    const key = start === -1 ? pathname : pathname.slice(start);

    return decodeURIComponent(key.replace(/^\//, ""));
  } catch {
    // 상대 경로 등 URL 로 파싱되지 않는 주소는 그대로 키로 본다.
    return imageUrl.replace(/^\//, "");
  }
}

//스토어 사진 업로드용 presigned URL 을 받아 S3 에 파일을 직접 올리고, 제출에 쓸 objectKey 를 돌려준다
export async function uploadShopImage(file: File) {
  const { data } = await apiClient.post<ShopImageUploadUrlResponse>(
    "/sellers/shop-image/upload-url",
    { contentType: file.type, contentLength: file.size },
  );
  const { objectKey, uploadUrl } = data.data;

  // presigned URL 은 서명에 없는 Authorization 헤더가 붙으면 거부되므로 apiClient 를 쓰지 않는다.
  await axios.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
  });

  return objectKey;
}
