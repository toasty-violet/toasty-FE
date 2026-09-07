import axios from "axios";

import { apiClient } from "@/lib/api-client";
import type { ShopImageUploadUrlResponse } from "@/types/upload";

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
