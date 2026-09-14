import { apiClient } from "@/lib/api-client";
import type { ApiSuccess } from "@/types/api";
import type {
  ProductImageUpload,
  ProductImageUploadFile,
} from "@/types/product";

/** 라이브 설정과 상품탭 수정이 함께 쓴다. 받은 objectKey 를 제출에 그대로 싣는다. */
export async function issueProductImageUploadUrls(
  files: ProductImageUploadFile[],
): Promise<ProductImageUpload[]> {
  const { data } = await apiClient.post<
    ApiSuccess<{ uploads: ProductImageUpload[] }>
  >("/seller/products/images/upload-url", { files });
  return data.data.uploads;
}

/**
 * 발급받은 주소로 사진 본문만 올린다.
 * presigned URL 이라 서명에 없는 헤더가 붙으면 403 이 난다.
 * apiClient 를 쓰면 Authorization 이 S3 로 나가므로 fetch 를 직접 쓴다.
 */
export async function uploadProductImage(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!response.ok) {
    throw new Error(`사진을 올리지 못했습니다. (${response.status})`);
  }
}
