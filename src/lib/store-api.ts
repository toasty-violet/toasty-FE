import { apiClient } from "@/lib/api-client";
import type { ApiSuccess } from "@/types/api";
import type { TopStore } from "@/types/store";

/** 인증이 없어도 부를 수 있고, 그때는 following 이 모두 false 로 온다. */
export async function getTopStores(): Promise<TopStore[]> {
  const { data } = await apiClient.get<ApiSuccess<TopStore[]>>("/stores/top");
  return data.data;
}

export async function followStore(sellerId: number) {
  await apiClient.post(`/stores/${sellerId}/follow`);
}

export async function unfollowStore(sellerId: number) {
  await apiClient.delete(`/stores/${sellerId}/follow`);
}
