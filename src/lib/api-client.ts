import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore } from "@/store/user-store";
import { ApiRequestError } from "@/lib/api-error";
import type { ApiFailure } from "@/types/api";
import type { RefreshResponse } from "@/types/auth";

// http 요청시 axios가 자동으로 토큰 정보 주입
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  // 요청 시점에 사용한 accessToken
  _tokenUsed?: string;
};

apiClient.interceptors.request.use((config: RetryableRequestConfig) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    config._tokenUsed = accessToken;
  }

  // 라이브 API는 아직 인증이 없어 X-Seller-Id로 셀러를 식별한다.
  // 서버가 JWT로 셀러를 알게 되면 이 두 줄만 지우면 된다.
  const sellerId = process.env.NEXT_PUBLIC_SELLER_ID;
  if (sellerId) {
    config.headers["X-Seller-Id"] = sellerId;
  }

  return config;
});

// 인터셉터 순환 호출 방지를 위한 리프레시 전용 인스턴스
const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isLoggingOut = false;

// 대기 중이던 요청이 모두 실패해도 로그아웃 처리는 한 번만 실행한다
function forceLogout() {
  if (isLoggingOut) return;
  isLoggingOut = true;
  // lib/auth.ts의 clearSession과 같은 일을 한다. auth.ts가 이 파일을 import하므로 순환을 피해 직접 비운다
  useAuthStore.getState().clearAuth();
  useUserStore.getState().clearUser();
  // axios 인터셉터는 React 렌더링/훅 바깥이라 useRouter/redirect를 쓸 수 없어 전체 페이지 이동으로 처리
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign("/login");
}

let refreshPromise: Promise<string> | null = null;

// 동시에 들어온 401이 /refresh를 중복 호출하지 않도록 하나의 Promise를 공유한다
export function requestRefresh() {
  if (!refreshPromise) {
    const pending: Promise<string> = refreshClient
      .post<RefreshResponse>("/refresh")
      .then(({ data }) => {
        const { accessToken } = data.data;
        // 대기 중인 요청이 깨어나기 전에 갱신해야 한다
        useAuthStore.getState().setAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        // 성공이든 실패든 해제해야 다음 만료 때 다시 재발급할 수 있다.
        // 이 사이 새 요청이 다음 Promise를 걸어뒀다면 그건 건드리지 않는다
        if (refreshPromise === pending) {
          refreshPromise = null;
        }
      });
    refreshPromise = pending;
  }
  return refreshPromise;
}

// 실패 응답의 공통 껍데기를 ApiRequestError로 바꿔, 호출부가 error.code로 분기할 수 있게 한다.
// 401 재발급 분기를 먼저 태운 뒤 최종 reject 경로에서만 부른다.
// 먼저 바꾸면 error.config·error.response가 사라져 재시도가 동작하지 않는다.
function toApiRequestError(error: AxiosError) {
  const response = error.response;
  const body = response?.data as ApiFailure | undefined;
  if (response && body?.success === false) {
    return new ApiRequestError(
      body.error.code,
      body.error.message,
      response.status,
      body.error.fields,
    );
  }
  return error;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    // 인증 엔드포인트의 401은 재발급 대상이 아니라 호출한 쪽이 처리한다
    const isAuthEndpoint =
      originalRequest?.url === "/refresh" ||
      originalRequest?.url === "/logout" ||
      originalRequest?.url === "/login/kakao";

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(toApiRequestError(error));
    }

    originalRequest._retry = true;

    // 이미 갱신된 토큰이 있으면 재발급 없이 재시도한다
    const currentToken = useAuthStore.getState().accessToken;
    if (currentToken && currentToken !== originalRequest._tokenUsed) {
      originalRequest.headers.Authorization = `Bearer ${currentToken}`;
      return apiClient(originalRequest);
    }

    try {
      const accessToken = await requestRefresh();
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      forceLogout();
      return Promise.reject(refreshError);
    }
  },
);
