import type { ApiSuccess } from "@/types/api";

// 스토어 사진 업로드용 presigned URL 발급 결과. uploadUrl 로 파일을 직접 올린다
export interface ShopImageUploadUrl {
  objectKey: string;
  uploadUrl: string;
  /** uploadUrl 이 유효한 시간(초). */
  expiresIn: number;
}

export type ShopImageUploadUrlResponse = ApiSuccess<ShopImageUploadUrl>;
