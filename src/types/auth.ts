// 로그인 후 받은 유저 데이터
export interface UserData {
  isOnboardingCompleted: boolean;
  accessToken: string;
}

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

// 카카오 로그인 API 응답
export interface KakaoLoginResponse {
  success: boolean;
  data: UserData | null;
  error: ApiError | null;
}

// accessToken 재발급 데이터
export interface RefreshData {
  accessToken: string;
}

// accessToken 재발급 API 응답
export interface RefreshResponse {
  success: boolean;
  data: RefreshData | null;
  error: ApiError | null;
}
