// 응답 실패 시 필드별 에러
export interface ApiErrorField {
  field: string;
  message: string;
}

// 응답 실패 시 에러 정보
export interface ApiError {
  code: string;
  message: string;
  fields: ApiErrorField[];
}

// 공통 API 응답 형식
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}
