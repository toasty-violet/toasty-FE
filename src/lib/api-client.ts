import axios, { isAxiosError } from "axios";
import { useAuthStore } from "@/store/auth-store";
import { ApiRequestError } from "@/lib/api-error";
import type { ApiResponse } from "@/types/api";

// http 요청시 axios가 자동으로 토큰 정보 주입
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // 라이브 API는 아직 인증이 없어 X-Seller-Id로 셀러를 식별한다.
  // 서버가 JWT로 셀러를 알게 되면 이 두 줄만 지우면 된다.
  const sellerId = process.env.NEXT_PUBLIC_SELLER_ID;
  if (sellerId) {
    config.headers["X-Seller-Id"] = sellerId;
  }

  return config;
});

// 실패 응답의 공통 껍데기를 ApiRequestError로 바꿔, 호출부가 error.code로 분기할 수 있게 한다.
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error) && error.response) {
      const body: ApiResponse<unknown> | undefined = error.response.data;
      if (body && body.success === false) {
        return Promise.reject(
          new ApiRequestError(
            body.error.code,
            body.error.message,
            error.response.status,
            body.error.fields,
          ),
        );
      }
    }
    return Promise.reject(error);
  },
);
