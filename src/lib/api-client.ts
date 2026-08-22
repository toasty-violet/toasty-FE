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

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

// 인터셉터 순환 호출 방지를 위한 리프레시 전용 인스턴스
const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string> | null = null;

function requestRefresh() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<RefreshResponse>("/refresh")
      .then(({ data }) => {
        if (!data.success || !data.data) {
          throw new Error(data.error?.message ?? "토큰 재발급에 실패했습니다.");
        }
        return data.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isRefreshOrLogout =
      originalRequest?.url === "/refresh" || originalRequest?.url === "/logout";

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isRefreshOrLogout
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await requestRefresh();
      useAuthStore.getState().setAccessToken(accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearAuth();
      // axios 인터셉터는 React 렌더링/훅 바깥이라 useRouter/redirect를 쓸 수 없어 전체 페이지 이동으로 처리
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login");
      return Promise.reject(refreshError);
    }
  },
);
