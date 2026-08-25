import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth-store";
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
  useAuthStore.getState().clearAuth();
  // axios 인터셉터는 React 렌더링/훅 바깥이라 useRouter/redirect를 쓸 수 없어 전체 페이지 이동으로 처리
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign("/login");
}

let refreshPromise: Promise<string> | null = null;

// 동시에 들어온 401이 /refresh를 중복 호출하지 않도록 하나의 Promise를 공유한다
export function requestRefresh() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<RefreshResponse>("/refresh")
      .then(({ data }) => {
        if (!data.success || !data.data) {
          throw new Error(data.error?.message ?? "토큰 재발급에 실패했습니다.");
        }
        const { accessToken } = data.data;
        // 대기 중인 요청이 깨어나기 전에 갱신해야 한다
        useAuthStore.getState().setAccessToken(accessToken);
        return accessToken;
      })
      .catch((error) => {
        // 실패한 경우에만 해제해 다음 401이 재시도할 수 있게 한다
        refreshPromise = null;
        throw error;
      });
  }
  return refreshPromise;
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
      return Promise.reject(error);
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
