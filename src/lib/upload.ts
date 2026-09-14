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
